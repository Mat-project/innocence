from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse, FileResponse
import os
import io
from datetime import datetime, timedelta
from django.utils import timezone
import csv
import tempfile
import json

# Attempt to import report generation libs, with graceful fallbacks
try:
    import xlsxwriter
except ImportError:
    xlsxwriter = None

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
except ImportError:
    reportlab = None

from .models import Report
from task.models import Task
from habit.models import Habit
from pomodoro.models import PomodoroSession
from django.contrib.auth.models import User

class ReportPreviewView(APIView):
    """API view to preview report data before generating"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return preview data for report"""
        user = request.user
        report_type = request.query_params.get('report_type', 'summary')
        date_from_str = request.query_params.get('date_from')
        date_to_str = request.query_params.get('date_to')
        sections = request.query_params.getlist('sections[]', ['tasks', 'pomodoro', 'habits', 'profile'])
        
        try:
            # Parse date range or use defaults
            if date_from_str:
                date_from = datetime.strptime(date_from_str, '%Y-%m-%d').date()
            else:
                date_from = (timezone.now() - timedelta(days=30)).date()
                
            if date_to_str:
                date_to = datetime.strptime(date_to_str, '%Y-%m-%d').date()
            else:
                date_to = timezone.now().date()
            
            # Prepare preview data based on report type
            preview_data = {
                'metrics': [],
                'tasks': [],
                'pomodoro': [],
                'habits': []
            }
            
            # Get task metrics if tasks section is included
            if 'tasks' in sections:
                tasks = Task.objects.filter(
                    owner=user,
                    created_at__date__gte=date_from,
                    created_at__date__lte=date_to
                )
                
                total_tasks = tasks.count()
                completed_tasks = tasks.filter(status='completed').count()
                completion_rate = int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
                
                preview_data['metrics'].append({
                    'label': 'Tasks Completed',
                    'value': f"{completed_tasks}/{total_tasks}",
                    'icon': 'tasks'
                })
                
                preview_data['metrics'].append({
                    'label': 'Completion Rate',
                    'value': f"{completion_rate}%",
                    'icon': 'tasks'
                })
                
                # Add sample tasks to the preview
                preview_data['tasks'] = [
                    {
                        'title': task.title,
                        'status': task.status,
                        'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else 'N/A',
                    }
                    for task in tasks.order_by('-created_at')[:10]
                ]
            
            # Get pomodoro metrics if pomodoro section is included
            if 'pomodoro' in sections:
                pomodoro_sessions = PomodoroSession.objects.filter(
                    user=user,
                    date__gte=date_from,
                    date__lte=date_to
                )
                
                total_focus_time = pomodoro_sessions.aggregate(total=models.Sum('focus_time'))['total'] or 0
                focus_hours = round(total_focus_time / 60, 1)  # Convert minutes to hours
                
                preview_data['metrics'].append({
                    'label': 'Focus Time',
                    'value': f"{focus_hours}h",
                    'icon': 'time'
                })
                
                # Add pomodoro data for chart preview
                preview_data['pomodoro'] = [
                    {
                        'date': session.date.strftime('%Y-%m-%d'),
                        'focus_time': session.focus_time,
                        'completed': session.completed
                    }
                    for session in pomodoro_sessions.order_by('-date')[:10]
                ]
            
            # Get habit metrics if habits section is included
            if 'habits' in sections:
                habits = Habit.objects.filter(user=user)
                
                if habits.exists():
                    try:
                        # Try to calculate streak metrics - depends on your model structure
                        max_streak = habits.aggregate(max_streak=models.Max('current_streak'))['max_streak'] or 0
                        
                        preview_data['metrics'].append({
                            'label': 'Highest Streak',
                            'value': str(max_streak),
                            'icon': 'calendar'
                        })
                    except:
                        # Fallback if the streak fields aren't available
                        preview_data['metrics'].append({
                            'label': 'Total Habits',
                            'value': str(habits.count()),
                            'icon': 'calendar'
                        })
                
                # Add habit data for visualization preview
                preview_data['habits'] = [
                    {
                        'name': habit.name,
                        'streak': getattr(habit, 'current_streak', 0),
                    }
                    for habit in habits
                ]
            
            return Response(preview_data)
            
        except Exception as e:
            print(f"Error generating report preview: {str(e)}")
            return Response(
                {"error": "Failed to generate report preview"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReportGenerateView(APIView):
    """API view to generate full reports"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate and return a report file"""
        user = request.user
        report_type = request.data.get('report_type', 'summary')
        report_format = request.data.get('format', 'pdf')
        date_from_str = request.data.get('date_from')
        date_to_str = request.data.get('date_to')
        include_charts = request.data.get('include_charts', True)
        include_metrics = request.data.get('include_metrics', True)
        sections = request.data.get('sections', ['tasks', 'pomodoro', 'habits', 'profile'])
        
        try:
            # Parse date range or use defaults
            if date_from_str:
                date_from = datetime.strptime(date_from_str, '%Y-%m-%d').date()
            else:
                date_from = (timezone.now() - timedelta(days=30)).date()
                
            if date_to_str:
                date_to = datetime.strptime(date_to_str, '%Y-%m-%d').date()
            else:
                date_to = timezone.now().date()
            
            # Create a record of this report generation
            report = Report.objects.create(
                user=user,
                report_type=report_type,
                format=report_format,
                date_from=date_from,
                date_to=date_to
            )
            
            # Generate the appropriate format
            if report_format == 'pdf':
                return self._generate_pdf_report(
                    user, report_type, date_from, date_to, 
                    include_charts, include_metrics, sections, report
                )
            elif report_format == 'excel':
                return self._generate_excel_report(
                    user, report_type, date_from, date_to, 
                    include_charts, include_metrics, sections, report
                )
            elif report_format == 'csv':
                return self._generate_csv_report(
                    user, report_type, date_from, date_to, 
                    include_metrics, sections, report
                )
            else:
                return Response(
                    {"error": "Unsupported report format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            print(f"Error generating report: {str(e)}")
            return Response(
                {"error": "Failed to generate report"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_pdf_report(self, user, report_type, date_from, date_to, 
                            include_charts, include_metrics, sections, report_obj):
        """Generate a PDF report"""
        try:
            # Check if reportlab is available
            if 'reportlab' not in globals() or reportlab is None:
                return Response(
                    {"error": "PDF generation is not available. Please install reportlab."},
                    status=status.HTTP_501_NOT_IMPLEMENTED
                )
            
            # Create a buffer for the PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = []
            
            # Add title
            title_text = f"{report_type.title()} Report"
            elements.append(Paragraph(title_text, styles['Title']))
            
            # Add date range
            date_range_text = f"Period: {date_from.strftime('%B %d, %Y')} to {date_to.strftime('%B %d, %Y')}"
            elements.append(Paragraph(date_range_text, styles['Normal']))
            elements.append(Spacer(1, 12))
            
            # Add metrics if requested
            if include_metrics:
                elements.append(Paragraph("Summary Metrics", styles['Heading2']))
                
                # Get data for metrics
                metrics_data = []
                metrics_data.append(['Metric', 'Value'])
                
                # Task metrics
                if 'tasks' in sections:
                    tasks = Task.objects.filter(
                        owner=user,
                        created_at__date__gte=date_from,
                        created_at__date__lte=date_to
                    )
                    
                    total_tasks = tasks.count()
                    completed_tasks = tasks.filter(status='completed').count()
                    completion_rate = int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
                    
                    metrics_data.append(['Total Tasks', str(total_tasks)])
                    metrics_data.append(['Completed Tasks', str(completed_tasks)])
                    metrics_data.append(['Completion Rate', f"{completion_rate}%"])
                
                # Pomodoro metrics
                if 'pomodoro' in sections:
                    pomodoro_sessions = PomodoroSession.objects.filter(
                        user=user,
                        date__gte=date_from,
                        date__lte=date_to
                    )
                    
                    total_sessions = pomodoro_sessions.count()
                    completed_sessions = pomodoro_sessions.filter(completed=True).count()
                    total_focus_time = pomodoro_sessions.aggregate(total=models.Sum('focus_time'))['total'] or 0
                    focus_hours = round(total_focus_time / 60, 1)
                    
                    metrics_data.append(['Focus Sessions', str(total_sessions)])
                    metrics_data.append(['Completed Sessions', str(completed_sessions)])
                    metrics_data.append(['Total Focus Time', f"{focus_hours} hours"])
                
                # Create metrics table
                metrics_table = Table(metrics_data)
                metrics_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                
                elements.append(metrics_table)
                elements.append(Spacer(1, 24))
            
            # Add task details if included
            if 'tasks' in sections:
                elements.append(Paragraph("Task Details", styles['Heading2']))
                
                # Get tasks for the period
                tasks = Task.objects.filter(
                    owner=user,
                    created_at__date__gte=date_from,
                    created_at__date__lte=date_to
                ).order_by('-created_at')
                
                if tasks:
                    task_data = []
                    task_data.append(['Title', 'Status', 'Priority', 'Due Date'])
                    
                    for task in tasks:
                        task_data.append([
                            task.title,
                            task.status.title(),
                            task.priority.title() if hasattr(task, 'priority') else 'N/A',
                            task.due_date.strftime('%Y-%m-%d') if task.due_date else 'N/A'
                        ])
                    
                    task_table = Table(task_data)
                    task_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    
                    elements.append(task_table)
                else:
                    elements.append(Paragraph("No tasks found for the selected period.", styles['Normal']))
                
                elements.append(Spacer(1, 24))
            
            # Add pomodoro details if included
            if 'pomodoro' in sections:
                elements.append(Paragraph("Pomodoro Sessions", styles['Heading2']))
                
                # Get pomodoro sessions for the period
                pomodoro_sessions = PomodoroSession.objects.filter(
                    user=user,
                    date__gte=date_from,
                    date__lte=date_to
                ).order_by('-date')
                
                if pomodoro_sessions:
                    pomodoro_data = []
                    pomodoro_data.append(['Date', 'Focus Time (mins)', 'Completed'])
                    
                    for session in pomodoro_sessions:
                        pomodoro_data.append([
                            session.date.strftime('%Y-%m-%d'),
                            str(session.focus_time),
                            'Yes' if session.completed else 'No'
                        ])
                    
                    pomodoro_table = Table(pomodoro_data)
                    pomodoro_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    
                    elements.append(pomodoro_table)
                else:
                    elements.append(Paragraph("No Pomodoro sessions found for the selected period.", styles['Normal']))
            
            # Build the PDF document
            doc.build(elements)
            buffer.seek(0)
            
            # Create the response with the PDF file
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{report_type}_report.pdf"'
            
            return response
            
        except Exception as e:
            print(f"Error generating PDF report: {str(e)}")
            raise
    
    def _generate_excel_report(self, user, report_type, date_from, date_to, 
                              include_charts, include_metrics, sections, report_obj):
        """Generate an Excel report"""
        try:
            # Check if xlsxwriter is available
            if 'xlsxwriter' not in globals() or xlsxwriter is None:
                return Response(
                    {"error": "Excel generation is not available. Please install xlsxwriter."},
                    status=status.HTTP_501_NOT_IMPLEMENTED
                )
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
                # Create workbook and worksheets
                workbook = xlsxwriter.Workbook(tmp.name)
                summary_sheet = workbook.add_worksheet('Summary')
                
                # Add formats
                title_format = workbook.add_format({
                    'bold': True,
                    'font_size': 16,
                    'align': 'center',
                    'valign': 'vcenter'
                })
                
                header_format = workbook.add_format({
                    'bold': True,
                    'bg_color': '#CCCCCC',
                    'border': 1
                })
                
                cell_format = workbook.add_format({
                    'border': 1
                })
                
                # Write title and date range
                summary_sheet.merge_range('A1:E1', f"{report_type.title()} Report", title_format)
                summary_sheet.merge_range(
                    'A2:E2', 
                    f"Period: {date_from.strftime('%B %d, %Y')} to {date_to.strftime('%B %d, %Y')}", 
                    workbook.add_format({'align': 'center'})
                )
                
                row = 4  # Start from row 4
                
                # Add metrics if requested
                if include_metrics:
                    summary_sheet.write(row, 0, "Summary Metrics", workbook.add_format({'bold': True, 'font_size': 14}))
                    row += 2
                    
                    # Write headers
                    summary_sheet.write(row, 0, "Metric", header_format)
                    summary_sheet.write(row, 1, "Value", header_format)
                    row += 1
                    
                    # Task metrics
                    if 'tasks' in sections:
                        tasks = Task.objects.filter(
                            owner=user,
                            created_at__date__gte=date_from,
                            created_at__date__lte=date_to
                        )
                        
                        total_tasks = tasks.count()
                        completed_tasks = tasks.filter(status='completed').count()
                        completion_rate = int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
                        
                        summary_sheet.write(row, 0, "Total Tasks", cell_format)
                        summary_sheet.write(row, 1, total_tasks, cell_format)
                        row += 1
                        
                        summary_sheet.write(row, 0, "Completed Tasks", cell_format)
                        summary_sheet.write(row, 1, completed_tasks, cell_format)
                        row += 1
                        
                        summary_sheet.write(row, 0, "Completion Rate", cell_format)
                        summary_sheet.write(row, 1, f"{completion_rate}%", cell_format)
                        row += 1
                    
                    # Pomodoro metrics
                    if 'pomodoro' in sections:
                        pomodoro_sessions = PomodoroSession.objects.filter(
                            user=user,
                            date__gte=date_from,
                            date__lte=date_to
                        )
                        
                        total_sessions = pomodoro_sessions.count()
                        completed_sessions = pomodoro_sessions.filter(completed=True).count()
                        total_focus_time = pomodoro_sessions.aggregate(total=models.Sum('focus_time'))['total'] or 0
                        focus_hours = round(total_focus_time / 60, 1)
                        
                        summary_sheet.write(row, 0, "Focus Sessions", cell_format)
                        summary_sheet.write(row, 1, total_sessions, cell_format)
                        row += 1
                        
                        summary_sheet.write(row, 0, "Completed Sessions", cell_format)
                        summary_sheet.write(row, 1, completed_sessions, cell_format)
                        row += 1
                        
                        summary_sheet.write(row, 0, "Total Focus Time (hours)", cell_format)
                        summary_sheet.write(row, 1, focus_hours, cell_format)
                        row += 1
                
                row += 2  # Add some space
                
                # Add task details if included
                if 'tasks' in sections:
                    # Create a separate worksheet for tasks
                    tasks_sheet = workbook.add_worksheet('Tasks')
                    
                    # Write headers
                    tasks_sheet.write(0, 0, "Title", header_format)
                    tasks_sheet.write(0, 1, "Status", header_format)
                    tasks_sheet.write(0, 2, "Priority", header_format)
                    tasks_sheet.write(0, 3, "Due Date", header_format)
                    tasks_sheet.write(0, 4, "Category", header_format)
                    tasks_sheet.write(0, 5, "Description", header_format)
                    
                    # Get tasks for the period
                    tasks = Task.objects.filter(
                        owner=user,
                        created_at__date__gte=date_from,
                        created_at__date__lte=date_to
                    ).order_by('-created_at')
                    
                    # Write task data
                    for i, task in enumerate(tasks):
                        row_idx = i + 1  # Start from row 1 (after header)
                        tasks_sheet.write(row_idx, 0, task.title, cell_format)
                        tasks_sheet.write(row_idx, 1, task.status.title(), cell_format)
                        tasks_sheet.write(
                            row_idx, 2, 
                            task.priority.title() if hasattr(task, 'priority') else 'N/A', 
                            cell_format
                        )
                        tasks_sheet.write(
                            row_idx, 3, 
                            task.due_date.strftime('%Y-%m-%d') if task.due_date else 'N/A', 
                            cell_format
                        )
                        tasks_sheet.write(
                            row_idx, 4, 
                            task.category if hasattr(task, 'category') and task.category else 'N/A', 
                            cell_format
                        )
                        tasks_sheet.write(
                            row_idx, 5, 
                            task.description if task.description else '', 
                            cell_format
                        )
                    
                    # Add summary link in main sheet
                    summary_sheet.write(row, 0, "Task Details", workbook.add_format({'bold': True, 'font_size': 14}))
                    summary_sheet.write(
                        row, 1, 
                        f"See 'Tasks' sheet ({tasks.count()} tasks)", 
                        workbook.add_format({'color': 'blue', 'underline': True})
                    )
                    row += 2
                
                # Add pomodoro details if included
                if 'pomodoro' in sections:
                    # Create a separate worksheet for pomodoro sessions
                    pomodoro_sheet = workbook.add_worksheet('Pomodoro')
                    
                    # Write headers
                    pomodoro_sheet.write(0, 0, "Date", header_format)
                    pomodoro_sheet.write(0, 1, "Focus Time (mins)", header_format)
                    pomodoro_sheet.write(0, 2, "Completed", header_format)
                    
                    # Get pomodoro sessions for the period
                    pomodoro_sessions = PomodoroSession.objects.filter(
                        user=user,
                        date__gte=date_from,
                        date__lte=date_to
                    ).order_by('-date')
                    
                    # Write pomodoro data
                    for i, session in enumerate(pomodoro_sessions):
                        row_idx = i + 1  # Start from row 1 (after header)
                        pomodoro_sheet.write(row_idx, 0, session.date.strftime('%Y-%m-%d'), cell_format)
                        pomodoro_sheet.write(row_idx, 1, session.focus_time, cell_format)
                        pomodoro_sheet.write(row_idx, 2, 'Yes' if session.completed else 'No', cell_format)
                    
                    # Add summary link in main sheet
                    summary_sheet.write(row, 0, "Pomodoro Sessions", workbook.add_format({'bold': True, 'font_size': 14}))
                    summary_sheet.write(
                        row, 1, 
                        f"See 'Pomodoro' sheet ({pomodoro_sessions.count()} sessions)", 
                        workbook.add_format({'color': 'blue', 'underline': True})
                    )
                    row += 2
                
                # Close the workbook
                workbook.close()
                
                # Open the file for reading
                with open(tmp.name, 'rb') as f:
                    response = HttpResponse(
                        f.read(),
                        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    )
                    response['Content-Disposition'] = f'attachment; filename="{report_type}_report.xlsx"'
                    return response
                
        except Exception as e:
            print(f"Error generating Excel report: {str(e)}")
            raise
    
    def _generate_csv_report(self, user, report_type, date_from, date_to, 
                            include_metrics, sections, report_obj):
        """Generate a CSV report"""
        try:
            # Create a response object with CSV content type
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{report_type}_report.csv"'
            
            # Create CSV writer
            writer = csv.writer(response)
            
            # Write header
            writer.writerow([f"{report_type.title()} Report"])
            writer.writerow([f"Period: {date_from.strftime('%B %d, %Y')} to {date_to.strftime('%B %d, %Y')}"])
            writer.writerow([])  # Empty row for spacing
            
            # Add metrics if requested
            if include_metrics:
                writer.writerow(["Summary Metrics"])
                writer.writerow(["Metric", "Value"])
                
                # Task metrics
                if 'tasks' in sections:
                    tasks = Task.objects.filter(
                        owner=user,
                        created_at__date__gte=date_from,
                        created_at__date__lte=date_to
                    )
                    
                    total_tasks = tasks.count()
                    completed_tasks = tasks.filter(status='completed').count()
                    completion_rate = int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
                    
                    writer.writerow(["Total Tasks", total_tasks])
                    writer.writerow(["Completed Tasks", completed_tasks])
                    writer.writerow(["Completion Rate", f"{completion_rate}%"])
                
                # Pomodoro metrics
                if 'pomodoro' in sections:
                    pomodoro_sessions = PomodoroSession.objects.filter(
                        user=user,
                        date__gte=date_from,
                        date__lte=date_to
                    )
                    
                    total_sessions = pomodoro_sessions.count()
                    completed_sessions = pomodoro_sessions.filter(completed=True).count()
                    total_focus_time = pomodoro_sessions.aggregate(total=models.Sum('focus_time'))['total'] or 0
                    focus_hours = round(total_focus_time / 60, 1)
                    
                    writer.writerow(["Focus Sessions", total_sessions])
                    writer.writerow(["Completed Sessions", completed_sessions])
                    writer.writerow(["Total Focus Time", f"{focus_hours} hours"])
                
                writer.writerow([])  # Empty row for spacing
            
            # Add task details if included
            if 'tasks' in sections:
                writer.writerow(["Task Details"])
                writer.writerow(["Title", "Status", "Priority", "Due Date", "Category", "Description"])
                
                # Get tasks for the period
                tasks = Task.objects.filter(
                    owner=user,
                    created_at__date__gte=date_from,
                    created_at__date__lte=date_to
                ).order_by('-created_at')
                
                for task in tasks:
                    writer.writerow([
                        task.title,
                        task.status.title(),
                        task.priority.title() if hasattr(task, 'priority') else 'N/A',
                        task.due_date.strftime('%Y-%m-%d') if task.due_date else 'N/A',
                        task.category if hasattr(task, 'category') and task.category else 'N/A',
                        task.description if task.description else ''
                    ])
                
                writer.writerow([])  # Empty row for spacing
            
            # Add pomodoro details if included
            if 'pomodoro' in sections:
                writer.writerow(["Pomodoro Sessions"])
                writer.writerow(["Date", "Focus Time (mins)", "Completed"])
                
                # Get pomodoro sessions for the period
                pomodoro_sessions = PomodoroSession.objects.filter(
                    user=user,
                    date__gte=date_from,
                    date__lte=date_to
                ).order_by('-date')
                
                for session in pomodoro_sessions:
                    writer.writerow([
                        session.date.strftime('%Y-%m-%d'),
                        session.focus_time,
                        'Yes' if session.completed else 'No'
                    ])
            
            return response
            
        except Exception as e:
            print(f"Error generating CSV report: {str(e)}")
            raise

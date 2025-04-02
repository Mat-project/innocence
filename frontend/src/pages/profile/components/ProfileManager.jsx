import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@components/ui/table";
import { Button } from "@components/ui/button";
import { Trash2, Edit, Plus } from "lucide-react";
import { Badge } from "@components/ui/badge";
import AddSectionModal from "../modals/AddSectionModal";
import { useSkills, useExperience, useEducation, usePortfolio } from "@hooks/useProfileSections";
import { SectionDialog } from "@components/ui/dialog";

export default function ProfileManager({ sectionType }) {
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const hookMap = {
    skills: useSkills(),
    experience: useExperience(),
    education: useEducation(),
    portfolio: usePortfolio()
  };
  
  const {
    [sectionType]: items,
    loading,
    [`add${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}`]: addItem,
    [`update${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}`]: updateItem,
    [`delete${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}`]: deleteItem
  } = hookMap[sectionType] || {};

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
    }
  };

  const handleSaveItem = async (data) => {
    let success;
    if (editingItem) {
      success = await updateItem(editingItem.id, data);
    } else {
      success = await addItem(data);
    }
    if (success) {
      setIsModalOpen(false);
    }
  };

  const renderTableItems = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center">Loading...</TableCell>
        </TableRow>
      );
    }
    if (!items || items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            No items found. Add your first one!
          </TableCell>
        </TableRow>
      );
    }
    return items.map(item => {
      let cells;
      switch(sectionType) {
        case 'skills':
          cells = (
            <>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Badge variant={item.category === 'technical' ? 'secondary' : 'outline'}>
                  {item.category === 'technical' ? 'Technical' : 'Soft Skill'}
                </Badge>
              </TableCell>
              <TableCell>{item.proficiency}/10</TableCell>
            </>
          );
          break;
        case 'experience':
          cells = (
            <>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.company}</TableCell>
              <TableCell>
                {new Date(item.start_date).toLocaleDateString()} - 
                {item.current ? ' Present' : item.end_date ? new Date(item.end_date).toLocaleDateString() : ''}
              </TableCell>
            </>
          );
          break;
        case 'education':
          cells = (
            <>
              <TableCell>{item.degree}</TableCell>
              <TableCell>{item.institution}</TableCell>
              <TableCell>
                {new Date(item.start_date).toLocaleDateString()} - 
                {item.end_date ? new Date(item.end_date).toLocaleDateString() : ''}
              </TableCell>
            </>
          );
          break;
        case 'portfolio':
          cells = (
            <>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.description?.substring(0, 50)}{item.description?.length > 50 ? '...' : ''}</TableCell>
              <TableCell>
                {item.technologies?.map(tech => (
                  <Badge key={tech} variant="outline" className="mr-1">{tech}</Badge>
                ))}
              </TableCell>
            </>
          );
          break;
        default:
          cells = (
            <>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.details}</TableCell>
            </>
          );
      }
      return (
        <TableRow key={item.id}>
          {cells}
          <TableCell className="text-right space-x-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  const getColumnHeaders = () => {
    switch(sectionType) {
      case 'skills': return ['Skill Name', 'Category', 'Proficiency', 'Actions'];
      case 'experience': return ['Job Title', 'Company', 'Period', 'Actions'];
      case 'education': return ['Degree', 'Institution', 'Period', 'Actions'];
      case 'portfolio': return ['Project', 'Description', 'Technologies', 'Actions'];
      default: return ['Name', 'Details', 'Actions'];
    }
  };

  const columnHeaders = getColumnHeaders();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Manager
        </h2>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columnHeaders.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableItems()}</TableBody>
        </Table>
      </div>
      <SectionDialog isOpen={isModalOpen} onOpenChange={setIsModalOpen} sectionType={sectionType}>
        <AddSectionModal sectionType={sectionType} initialData={editingItem || {}} onCancel={() => setIsModalOpen(false)} onSave={handleSaveItem} />
      </SectionDialog>
    </div>
  );
}

import Image from "../../../asserts/image"
import { ExternalLink, Edit, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"

const baseUrl = import.meta.env.VITE_API_URL || '';

const getImageSrc = (project) => {
  let src = "";
  if (project.image && typeof project.image === "string" && project.image.trim() !== "") {
    src = project.image;
  } else if (project.imageFile instanceof File) { 
    const blobUrl = URL.createObjectURL(project.imageFile);
    return blobUrl;
  } else {
    src = "/placeholder.svg?height=400&width=600";
  }
  try {
    const imageUrl = new URL(src, baseUrl);
    return imageUrl.toString();
  } catch (err) {
    return `${baseUrl}${src}`;
  }
};

export default function ProfilePortfolio({ portfolio = [], onEdit, onItemEdit, isPublicView = false }) {
  const handlePortfolioClick = (project) => {
    if (onItemEdit && typeof onItemEdit === 'function') {
      onItemEdit('portfolio', project);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Portfolio & Projects</CardTitle>
          {!isPublicView && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit && typeof onEdit === 'function' && onEdit('portfolio')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {portfolio.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No portfolio projects added yet. Showcase your work by adding projects.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.map((project) => (
              <div
                key={project.id}
                className="group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer"
                onClick={() => handlePortfolioClick(project)}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={getImageSrc(project)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const fallback = `${baseUrl}/placeholder.svg?height=400&width=600`;
                      if (e.target.src.includes("placeholder.svg")) return;
                      e.target.onerror = null;
                      e.target.src = fallback;
                      console.error("Error loading image for project", project.id, e);
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  {project.project_link && (
                    <a
                      href={project.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                    >
                      View Project <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isPublicView && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => onEdit && typeof onEdit === 'function' && onEdit('portfolio')}
            >
              {portfolio.length > 0 ? "Add New Project" : "Add Projects"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


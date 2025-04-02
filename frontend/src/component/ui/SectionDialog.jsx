import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function SectionDialog({ 
  isOpen, 
  onOpenChange, 
  sectionType, 
  children,
  hideTitle = false 
}) {
  // Format the section type for display
  const displaySectionType = sectionType ? 
    sectionType.charAt(0).toUpperCase() + sectionType.slice(1) : 
    "Section";
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        {hideTitle ? (
          // When title is hidden, still provide both title and description for screen readers
          <VisuallyHidden asChild>
            <DialogHeader>
              <DialogTitle>{displaySectionType} Information</DialogTitle>
              <DialogDescription>
                Manage your {sectionType || 'profile'} information.
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>
        ) : (
          <DialogHeader>
            <DialogTitle>{displaySectionType} Information</DialogTitle>
            <DialogDescription>
              Manage your {sectionType || 'profile'} information.
            </DialogDescription>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../../../service/api';
import { toast } from 'sonner'; // Assuming you're using sonner now

// Error handling helper
const handleApiError = (error, message) => {
  console.error(`${message}:`, error);
  
  let errorMessage = message;
  if (error.response && error.response.data) {
    errorMessage += `: ${error.response.data.error || error.response.data.detail || 'Unknown error'}`;
  } else if (error.message) {
    errorMessage += `: ${error.message}`;
  }
  
  toast.error(errorMessage);
};

export const useSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.getSkills();
      setSkills(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.warn('Skills endpoint not responding, falling back to profile data');
      
      // Fallback: Try fetching from main profile endpoint
      try {
        const profileResponse = await profileAPI.getProfile();
        if (profileResponse?.data?.skills) {
          setSkills(Array.isArray(profileResponse.data.skills) ? profileResponse.data.skills : []);
        } else {
          // If profile doesn't have skills either, set empty array
          setSkills([]);
        }
      } catch (fallbackErr) {
        console.error('Both skills endpoint and profile fallback failed:', err.message);
        setError(err.message || 'Failed to load skills data');
        setSkills([]); // Ensure we set an empty array rather than undefined
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Updated addSkill: prepare the correct data format for the API endpoint
  const addSkill = async (skillData) => {
    setLoading(true);
    try {
      // Make sure we have valid data
      if (!skillData || !skillData.name) {
        throw new Error('Skill name is required');
      }
      
      // Clean up data before sending - ensure we have the required fields in the correct format
      const cleanedData = {
        name: skillData.name?.trim(),
        category: skillData.category || 'technical',
        level: skillData.level || 'Beginner'
      };
      
      // Log the data we're sending for debugging
      console.log("Adding skill with data:", cleanedData);
      
      const response = await profileAPI.addSkill(cleanedData);
      console.log("Skill add response:", response);
      
      // Append the new skill to the current skills array
      setSkills(prev => [...prev, response.data]);
      
      // Show a success toast
      toast.success("Skill added successfully!");
      return true;
    } catch (err) {
      console.error("Error adding skill:", err);
      
      // Improved error handling
      let errorMessage = 'Failed to add skill';
      
      // Extract error message from response if available
      if (err.response) {
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid skill data';
          
          // If validation errors are in a nested format
          if (err.response.data) {
            const validationErrors = [];
            Object.entries(err.response.data).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                validationErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                validationErrors.push(`${field}: ${errors}`);
              }
            });
            
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join('; ');
            }
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show the error message
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Make sure updateSkill works with string toast messages and has proper data formatting
  const updateSkill = async (id, skillData) => {
    setLoading(true);
    try {
      // Clean up data before sending
      const cleanedData = {
        name: skillData.name,
        category: skillData.category || 'technical',
        level: skillData.level || 'Beginner'
      };
      
      const response = await profileAPI.updateSkill(id, cleanedData);
      setSkills(prev => prev.map(skill => 
        skill.id === id ? response.data : skill
      ));
      toast.success("Skill updated successfully!");
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update skill');
      toast.error("Failed to update skill: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (id) => {
    setLoading(true);
    try {
      await profileAPI.deleteSkill(id);
      // Update local state by filtering out the deleted skill
      setSkills(prevSkills => prevSkills.filter(skill => skill.id !== id));
      toast.success("Skill deleted successfully!");
      return true;
    } catch (error) {
      handleApiError(error, "Failed to delete skill");
      toast.error("Failed to delete skill: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return {
    skills,
    loading,
    error,
    fetchSkills,
    addSkill,
    updateSkill,
    deleteSkill
  };
};

export const useExperience = () => {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExperience = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.getExperience();
      setExperience(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.warn('Experience endpoint not responding, falling back to profile data');
      
      // Fallback: Try fetching from main profile endpoint
      try {
        const profileResponse = await profileAPI.getProfile();
        if (profileResponse?.data?.experience) {
          setExperience(Array.isArray(profileResponse.data.experience) ? profileResponse.data.experience : []);
        } else {
          // If profile doesn't have experience either, set empty array
          setExperience([]);
        }
      } catch (fallbackErr) {
        console.error('Both experience endpoint and profile fallback failed:', err.message);
        setError(err.message || 'Failed to load experience data');
        setExperience([]); // Ensure we set an empty array rather than undefined
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addExperience = async (expData) => {
    setLoading(true);
    try {
      const response = await profileAPI.addExperience(expData);
      setExperience(prev => [...prev, response.data]);
      toast.success("Experience added successfully!");
      return true;
    } catch (err) {
      setError(err.message || 'Failed to add experience');
      toast.error("Failed to add experience.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = async (id, expData) => {
    setLoading(true);
    try {
      const response = await profileAPI.updateExperience(id, expData);
      setExperience(prev => prev.map(exp => 
        exp.id === id ? response.data : exp
      ));
      toast.success("Experience updated successfully!");
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update experience');
      toast.error("Failed to update experience: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (id) => {
    setLoading(true);
    try {
      await profileAPI.deleteExperience(id);
      setExperience(prev => prev.filter(exp => exp.id !== id));
      toast.success("Experience deleted successfully!");
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete experience');
      toast.error("Failed to delete experience: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  return {
    experience,
    loading,
    error,
    fetchExperience,
    addExperience,
    updateExperience,
    deleteExperience
  };
};

export const useEducation = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEducation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.getEducation();
      setEducation(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.warn('Education endpoint not responding, falling back to profile data');
      
      // Fallback: Try fetching from main profile endpoint
      try {
        const profileResponse = await profileAPI.getProfile();
        if (profileResponse?.data?.education) {
          setEducation(Array.isArray(profileResponse.data.education) ? profileResponse.data.education : []);
        } else {
          // If profile doesn't have education either, set empty array
          setEducation([]);
        }
      } catch (fallbackErr) {
        console.error('Both education endpoint and profile fallback failed:', err.message);
        setError(err.message || 'Failed to load education data');
        setEducation([]); // Ensure we set an empty array rather than undefined
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addEducation = async (eduData) => {
    setLoading(true);
    try {
      const response = await profileAPI.addEducation(eduData);
      setEducation(prev => [...prev, response.data]);
      toast({
        title: "Success",
        description: "Education added successfully!",
      });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to add education');
      toast({
        title: "Error",
        description: "Failed to add education.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = async (id, eduData) => {
    setLoading(true);
    try {
      const response = await profileAPI.updateEducation(id, eduData);
      setEducation(prev => prev.map(edu => 
        edu.id === id ? response.data : edu
      ));
      // Use a success string instead of an object
      toast.success("Education updated successfully!");
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update education');
      // Use a string error message
      toast.error("Failed to update education: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEducation = async (id) => {
    setLoading(true);
    try {
      await profileAPI.deleteEducation(id);
      setEducation(prev => prev.filter(edu => edu.id !== id));
      toast.success("Education deleted successfully!");
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete education');
      toast.error("Failed to delete education: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  return {
    education,
    loading,
    error,
    fetchEducation,
    addEducation,
    updateEducation,
    deleteEducation
  };
};

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.getPortfolio();
      setPortfolio(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.warn('Portfolio endpoint not responding, falling back to profile data');
      try {
        const profileResponse = await profileAPI.getProfile();
        if (profileResponse?.data?.portfolio) {
          setPortfolio(Array.isArray(profileResponse.data.portfolio) ? profileResponse.data.portfolio : []);
        } else {
          setPortfolio([]);
        }
      } catch (fallbackErr) {
        console.error('Both portfolio endpoint and profile fallback failed:', err.message);
        setError(err.message || 'Failed to load portfolio data');
        setPortfolio([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addPortfolio = async (projectData) => {
    setLoading(true);
    try {
      const response = await profileAPI.addPortfolio(projectData);
      setPortfolio(prev => [...prev, response.data]);
      toast({
        title: "Success",
        description: "Project added successfully!",
      });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to add project');
      toast({
        title: "Error",
        description: "Failed to add project.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolio = async (id, projectData) => {
    setLoading(true);
    try {
      const response = await profileAPI.updatePortfolio(id, projectData);
      setPortfolio(prev => prev.map(project => 
        project.id === id ? response.data : project
      ));
      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      toast({
        title: "Error",
        description: "Failed to update project.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolio = async (id) => {
    setLoading(true);
    try {
      await profileAPI.deletePortfolio(id);
      setPortfolio(prev => prev.filter(project => project.id !== id));
      toast.success("Project deleted successfully!");
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      toast.error("Failed to delete project: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolio,
    loading,
    error,
    fetchPortfolio,
    addPortfolio,
    updatePortfolio,
    deletePortfolio
  };
};

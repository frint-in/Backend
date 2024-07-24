export const areRequiredFieldsFilled = (user) => {
    // List of required fields
    const requiredFields = ['uname', 'email', 'avatar', 'phno', 'specialisation', 'education', 'dob', 'languages', 'skills', 'resume'];
    
    // Loop through each required field
    for (let field of requiredFields) {
      // Check if the field is empty or contains only whitespace
      if (!user[field] || user[field].trim() === '') {
        // If any field is empty or contains only whitespace, return false
        return false;
      }
    }
    
    // If all required fields are filled, return true
    return true;
  };
  
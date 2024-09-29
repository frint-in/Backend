export const areRequiredFieldsFilled = (user) => {
  // List of required fields
  const requiredFields = [
    "uname",
    "email",
    "phno",
    "dob",
    "gender",
    "avatar",
    "resume",
  ];

  // Loop through each required field
  for (let field of requiredFields) {
    const value = user[field];

    // Check if the field is missing, null, or an empty string
    if (typeof value !== "string") {
      // If any field is missing, not a string, or contains only whitespace, return false
      return false;
    }
  }
  // If all required fields are filled, return true
  return true;
};

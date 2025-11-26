// Test script to check medications API
const testMedications = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/medications", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("API Response:", data);
    console.log("Medications count:", data.medications?.length || 0);
  } catch (error) {
    console.error("Error:", error);
  }
};

testMedications();

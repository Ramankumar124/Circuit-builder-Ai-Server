export const handleError = (error, res) => {
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).send({ message: validationErrors[0], errors: "Validation error" });
    }
  
    // Handle unique constraint error (MongoDB duplicate key error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]; // Get the field causing the duplication
      return res.status(400).send({ message: `${field} must be unique.`, errors: "Duplicate entry" });
    }
    console.log(error)
  
    return res.status(500).send({ message: "Server error", error: error.message });
  };

export const handleGeminiError = (error, res) => {
  let statusCode = 500;
  let errorMessage = "An unexpected error occurred. Please try again later.";

  if (error instanceof Error) {
    // Network-related errors
    if (error.message.includes("network") || error.message.includes("fetch")) {
      statusCode = 503;
      errorMessage = "A network error occurred. Please check your connection and try again.";
    }
    // API key or authentication errors
    else if (error.message.includes("API key") || error.message.includes("authentication")) {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your API key and try again.";
    }
    // Invalid or empty response errors
    else if (error.message.includes("No response text") || error.message.includes("invalid response")) {
      statusCode = 422;
      errorMessage = "The API returned an invalid or empty response. Please check your input and try again.";
    }
    // Rate limit or quota errors
    else if (error.message.includes("rate limit") || error.message.includes("quota")) {
      statusCode = 429;
      errorMessage = "Rate limit exceeded. Please wait and try again later.";
    }
    // Other known errors
    else {
      errorMessage = error.message || errorMessage;
    }
  }

  // Send the error response to the client
  res.status(statusCode).send({
    message: errorMessage,
    data: null
  })
};
  
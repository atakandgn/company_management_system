const { connectToDatabase } = require("./db");
const app = require("./app");
require("dotenv").config();


const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

startServer();

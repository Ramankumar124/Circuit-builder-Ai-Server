# CircuitBuilder AI - Interactive Circuit Design Tool   [![Live Demo](https://img.shields.io/badge/demo-live-green?style=for-the-badge)](https://cbai.ramankumar.me)

🚀 **CircuitBuilder AI** is an intelligent circuit design assistant that generates electronic circuits based on user prompts. It provides an intuitive interface with real-time component visualization, sharing options, and multi-format exports.  

## ✨ Features  

### 🛠️ Circuit Design  
- **AI-Powered Circuit Generation** – Describe your circuit in natural language, and the AI generates a schematic.  
- **Drag Components** – Easily drag the component in  circuits for better clearity.  
- **Custom Electrical Components** – Resistors, batteries, capacitors, and more with realistic designs.  
- **Real Resistor Color Coding** – Displays resistor color bands based on their values (e.g., 220Ω → Red, Red, Brown).  

### 📤 Export & Share  
- **Multi-Format Export** – Download circuits as **PDF, PNG, JPG, or SVG**.  
- **Shareable Links & QR Codes** – Quickly share circuits via URL or QR code.  
- **Social Media Sharing** – Directly post designs to platforms.  

### 🔍 Component Details & Learning  
- **Component Specifications** – Get detailed info on any part in the circuit.  
- **Explanations** – Understand circuit behavior with AI-generated insights.  

### 📂 Project Management  
- **Save to Projects** – Organize designs into projects.  
- **Recent Circuits** – Quickly access your latest work.  
- **Frequently Used Components** – Track common parts.  

## 🛠️ Technologies Used  
- **Frontend**: React, React Flow (for circuit layout), Tailwind CSS, shadcn/ui, React Icons  
- **Backend**: Node.js, Express  
- **Database**: PostgreSQL (with Prisma ORM)  
- **AI Integration**: Custom system prompt used to talk to llm and create circuit 

## 🚀 Getting Started  

### Prerequisites  
- Node.js 
- PostgreSQL  
- npm / yarn  

### Installation  
1. Clone the repository:  
   ```sh
   git clone https://github.com/Ramankumar124/Circuit-builder-Ai.git
   ```  
2. Install dependencies:  
   ```sh
   cd Circuit-builder-Ai
   npm install
   cd client && npm install
   ```  
3. Set up the database:  
   - Configure `.env` using `.env.example`.  
   - Run migrations:  
     ```sh
     npx prisma migrate dev
     ```  
4. Start the development server:  
   ```sh
   npm run dev  # Starts both backend and frontend
   ```  

## 🙌 Contributing  
Contributions are welcome! Open an issue or submit a PR.  

---  
🔌 **Build, Share, and Learn Circuits with AI!**  

*(Replace placeholder links with actual repo & demo URLs.)*  
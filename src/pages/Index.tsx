import ChatInterface from "../components/chat/ChatInterface";
import { ThemeProvider } from "next-themes";

const Index = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <ChatInterface />
      </div>
    </ThemeProvider>
  );
};

export default Index;

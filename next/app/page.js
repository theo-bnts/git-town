import Image from "next/image";
import Button from "./components/Button";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button variant="accent">Assccent Butwdvcxscton</Button>
      <Button variant="warn">Warn Button</Button>
    </div>
  );
}

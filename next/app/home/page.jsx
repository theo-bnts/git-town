// app/home/page.jsx

import Image from "next/image";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--primary-color)]">
      <Card variant="base">
        <Button variant="default">Connexion</Button>
        <Button variant="warn">Login</Button>
        <Button variant="danger">Login</Button>
        <Input variant="default" placeholder="Email" />
      </Card>
    </div>
  );
}
// app/components/layout/LoginForm.jsx
import React from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Text from "../ui/Text";

const LoginForm = () => {
  return (
    <Card variant="default">
      <Button variant="default">
        <Text variant="boldWhite">Connexion</Text>
      </Button>
      <Input variant="default" placeholder={<Text variant="hint">Email</Text>} />
    </Card>
  );
}

export default LoginForm;

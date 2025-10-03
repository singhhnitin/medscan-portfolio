import { useState } from "react";
import { VStack, Input, Button, Text } from "@chakra-ui/react";
import axios from "axios";

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/upload", formData);
      setMessage("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error uploading file.");
    }
  };

  return (
    <VStack p={5} spacing={4} borderWidth={1} borderRadius="lg" maxW="md" mx="auto" mt={10}>
      <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <Button colorScheme="teal" onClick={handleUpload}>
        Upload Report
      </Button>
      {message && <Text>{message}</Text>}
    </VStack>
  );
}


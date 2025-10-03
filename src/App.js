import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  Text,
  Image,
  useToast,
  Icon,
  Spinner,
  Badge,
  Container,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FiUpload, FiCamera, FiFileText, FiCheck, FiBarChart3 } from "react-icons/fi";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast({
        title: "Image uploaded successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Please select a valid image file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const scanPrescription = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patient_name', 'John Doe'); // You can add a form field for this

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Format the response for display
      const formattedResult = `📄 File: ${result.filename}\n\n` +
        `🔍 Extracted Lab Values:\n` +
        result.lab_values.map((lab, index) => 
          `${index + 1}. ${lab.test}: ${lab.value} ${lab.unit}`
        ).join('\n') +
        `\n\n✅ ${result.message}`;
      
      setExtractedText(formattedResult);
      
      toast({
        title: "Prescription processed successfully!",
        description: `Found ${result.lab_values.length} lab values`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error:', error);
      setExtractedText(`❌ Error processing file: ${error.message}`);
      toast({
        title: "Error processing prescription",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedText("");
    setIsLoading(false);
  };

  return (
    <Box className="App" minH="100vh" w="100vw">
      <Container maxW="container.xl" p={0}>
        <Tabs isFitted variant="enclosed" colorScheme="teal">
          <TabList mb={4}>
            <Tab>
              <Icon as={FiFileText} mr={2} />
              Upload Document
            </Tab>
            <Tab>
              <Icon as={FiBarChart3} mr={2} />
              Analytics Dashboard
            </Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel p={0}>
              <Box className="upload-container">
          <VStack spacing={8} className="prescription-scanner">
            {/* Header */}
            <VStack spacing={4}>
              <HStack spacing={3}>
                <Icon as={FiFileText} boxSize={8} color="teal.500" />
                <Heading size="xl" color="teal.600">
                  MedScan
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.600" textAlign="center">
                Upload your prescription image and extract medication information instantly
              </Text>
            </VStack>

            {/* Upload Area */}
            {!previewUrl && (
              <Box
                className={`upload-area ${dragOver ? "dragover" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                w="100%"
              >
                <VStack spacing={4}>
                  <Icon as={FiUpload} boxSize={12} color="teal.400" />
                  <Text fontSize="xl" fontWeight="semibold" color="gray.700">
                    Drop your prescription image here
                  </Text>
                  <Text color="gray.500">or</Text>
                  <Button
                    leftIcon={<FiCamera />}
                    colorScheme="teal"
                    size="lg"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    Choose File
                  </Button>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <Text fontSize="sm" color="gray.400">
                    Supports: JPG, PNG, GIF (Max 10MB)
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <VStack spacing={4} w="100%">
                <Image
                  src={previewUrl}
                  className="prescription-preview"
                  alt="Prescription preview"
                />
                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiCheck />}
                    colorScheme="teal"
                    size="lg"
                    onClick={scanPrescription}
                    isLoading={isLoading}
                    loadingText="Scanning..."
                  >
                    Scan Prescription
                  </Button>
                  <Button variant="outline" onClick={resetApp}>
                    Upload New Image
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Loading State */}
            {isLoading && (
              <VStack spacing={4}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
                <Text>Processing your prescription...</Text>
              </VStack>
            )}

            {/* Results */}
            {extractedText && (
              <Card className="results-section" w="100%">
                <CardHeader>
                  <HStack>
                    <Badge colorScheme="green">Extraction Complete</Badge>
                    <Heading size="md">Extracted Information</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text whiteSpace="pre-line" fontSize="sm" fontFamily="mono">
                    {extractedText}
                  </Text>
                </CardBody>
              </Card>
            )}
          </VStack>
            </Box>
            </TabPanel>
            
            <TabPanel p={0}>
              <Dashboard />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}

export default App;

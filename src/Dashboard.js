import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Spinner,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FiUser, FiActivity, FiTrendingUp, FiCalendar } from 'react-icons/fi';

const Dashboard = () => {
  const [patientName, setPatientName] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const toast = useToast();

  const fetchReports = async () => {
    if (!patientName.trim()) {
      toast({
        title: 'Please enter a patient name',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/get-reports/${patientName}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports);
      calculateStats(data.reports);
      
      toast({
        title: `Found ${data.reports.length} reports`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error fetching reports',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reports) => {
    if (!reports || reports.length === 0) {
      setStats(null);
      return;
    }

    const allLabValues = reports.flatMap(report => report.lab_values || []);
    const totalTests = allLabValues.length;
    const uniqueTests = new Set(allLabValues.map(lab => lab.test)).size;
    const avgValuesPerReport = totalTests / reports.length;

    setStats({
      totalReports: reports.length,
      totalTests,
      uniqueTests,
      avgValuesPerReport: Math.round(avgValuesPerReport * 10) / 10,
    });
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'normal': return 'green';
      case 'warning': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" color="teal.600" mb={2}>
            📊 MedScan Analytics Dashboard
          </Heading>
          <Text color="gray.600">
            View patient reports, lab trends, and medical history
          </Text>
        </Box>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <Heading size="md">🔍 Patient Lookup</Heading>
          </CardHeader>
          <CardBody>
            <HStack>
              <FormControl flex="1">
                <FormLabel>Patient Name</FormLabel>
                <Input
                  placeholder="Enter patient name..."
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchReports()}
                />
              </FormControl>
              <Button
                leftIcon={<FiUser />}
                colorScheme="teal"
                onClick={fetchReports}
                isLoading={loading}
                mt={6}
              >
                Get Reports
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Reports</StatLabel>
                  <StatNumber>{stats.totalReports}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Medical documents
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Lab Tests</StatLabel>
                  <StatNumber>{stats.totalTests}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Total values extracted
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Unique Tests</StatLabel>
                  <StatNumber>{stats.uniqueTests}</StatNumber>
                  <StatHelpText>
                    Different test types
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Avg per Report</StatLabel>
                  <StatNumber>{stats.avgValuesPerReport}</StatNumber>
                  <StatHelpText>
                    Values per document
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="teal.500" />
            <Text mt={4}>Loading patient reports...</Text>
          </Box>
        )}

        {/* Reports List */}
        {reports.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">📋 Medical Reports</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {reports.map((report, index) => (
                  <Card key={index} variant="outline">
                    <CardBody>
                      <HStack justify="space-between" mb={3}>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <FiCalendar />
                            <Text fontWeight="bold">
                              {new Date(report.report_date).toLocaleDateString()}
                            </Text>
                          </HStack>
                          <HStack>
                            <FiActivity />
                            <Text fontSize="sm" color="gray.600">
                              Source: {report.source_file}
                            </Text>
                          </HStack>
                        </VStack>
                        
                        {report.category && (
                          <Badge 
                            colorScheme={getCategoryColor(report.category)} 
                            size="lg"
                          >
                            {report.category}
                          </Badge>
                        )}
                      </HStack>

                      {report.lab_values && report.lab_values.length > 0 && (
                        <Box>
                          <Text fontWeight="semibold" mb={2}>Lab Values:</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                            {report.lab_values.map((lab, labIndex) => (
                              <Box 
                                key={labIndex} 
                                p={2} 
                                bg="gray.50" 
                                borderRadius="md"
                              >
                                <Text fontWeight="semibold">{lab.test}</Text>
                                <Text color="teal.600">
                                  {lab.value} {lab.unit}
                                </Text>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Empty State */}
        {!loading && reports.length === 0 && patientName && (
          <Box textAlign="center" py={8}>
            <Text fontSize="xl" color="gray.500">
              📄 No reports found for "{patientName}"
            </Text>
            <Text color="gray.400">
              Try uploading some medical documents first
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default Dashboard;
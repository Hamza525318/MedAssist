const functionSchemas = [
    {
      name: 'getPatientDetails',
      description: 'Get complete details of a patient including their history and lab reports',
      parameters: {
        type: 'object',
        properties: {
          patientId: {
            type: 'string',
            description: 'The MongoDB _id of the patient',
          },
        },
        required: ['patientId'],
      },
    },
    {
      name: 'buildQuery',
      description: 'Build and execute a custom query to filter patients, history, or lab reports',
      parameters: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description: 'The filter criteria for the query',
            properties: {
              field: {
                type: 'string',
                description: 'Field to filter by (e.g., reportType, gender, etc.)',
              },
              value: {
                type: 'string',
                description: 'Value to filter by',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return',
              },
              sortBy: {
                type: 'string',
                description: 'Field to sort by',
              },
              sortOrder: {
                type: 'string',
                enum: ['asc', 'desc'],
                description: 'Sort order (asc or desc)',
              },
            },
          },
        },
        required: ['filters'],
      },
    },
    {
      name: 'summarizeReports',
      description: 'Generate a summary of the most recent lab reports for a patient',
      parameters: {
        type: 'object',
        properties: {
          patientId: {
            type: 'string',
            description: 'The MongoDB _id of the patient',
          },
          reportType: {
            type: 'string',
            description: 'Type of reports to summarize (e.g., "xray", "blood_test")',
          },
          limit: {
            type: 'number',
            description: 'Number of most recent reports to include in summary',
            default: 2,
          },
        },
        required: ['patientId', 'reportType'],
      },
    },
    {
      name: 'getDoctorKnowledge',
      description: 'Get general medical knowledge or information without accessing patient data',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The medical question or topic to get information about',
          },
        },
        required: ['query'],
      },
    },
  ];
  
  module.exports = functionSchemas;
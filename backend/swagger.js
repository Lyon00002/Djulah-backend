// swagger.js  (root folder)
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Dynamic server URL based on environment
const getServerUrl = () => {
  // Render automatically provides RENDER_EXTERNAL_URL
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  // Fallback for other production environments
  if (process.env.NODE_ENV === 'production') {
    return 'https://klarity-dashboard.onrender.com';
  }

  // Development mode
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Djulah Client Auth API',
      version: '1.0.0',
      description: 'Client authentication endpoints for Djulah (register, verify email, login, password reset, profile).',
      contact: {
        name: 'Djulah Team',
        email: 'hello@djulah.cm'
      }
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      },
      {
        url: 'https://klarity-dashboard.onrender.com',
        description: 'Production Server (Djulah)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [
    './routes/authRoutes.js',
    './controllers/authController.js',
    './swaggerSchemas.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  // Swagger UI options for better UX
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Djulah Client Auth API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true
    }
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  const port = process.env.PORT || 5000;
  console.log(`📚 Swagger UI is live at http://localhost:${port}/api-docs`);
};

export default swaggerDocs;
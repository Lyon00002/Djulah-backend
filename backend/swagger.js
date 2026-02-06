// swagger.js  (root folder)
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config/index.js';

// Dynamic server URL based on environment
const getServerUrl = () => {
  return config.publicBaseUrl;
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
        description: config.isProd ? 'Production Server' : 'Development Server'
      },
      {
        url: `http://localhost:${config.port}`,
        description: 'Local Development Server'
      },
      {
        url: config.publicBaseUrl,
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
  
  console.log(`📚 Swagger UI is live at http://localhost:${config.port}/api-docs`);
};

export default swaggerDocs;
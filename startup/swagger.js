module.exports = function (app) {
  const swaggerJsDoc = require("swagger-jsdoc");
  const swaggerUi = require("swagger-ui-express");
  const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "Music School",
        description: "Music School API",
        contact: {
          name: "Oleksandr Shevchuk",
        },
        servers: ["http://localhost:5000"],
      },
    },
    apis: ["./routes/*.js"],
  };
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

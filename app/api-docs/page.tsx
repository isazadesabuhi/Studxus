"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          📚 Documentation API - GDP
        </h1>
        <SwaggerUI url="/openapi.yaml" />
      </div>
    </div>
  );
}

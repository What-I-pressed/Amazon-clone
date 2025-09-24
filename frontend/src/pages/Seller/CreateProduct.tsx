import React from "react";
import CreateAdForm from "../../components/CreateAdForm";

const CreateProductPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Створення товару</h1>
      <CreateAdForm />
    </div>
  );
};

export default CreateProductPage;

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Calendário de Casal</h1>
        <p className="text-xl text-gray-600 mb-6">
          Gerencie eventos compartilhados com seu parceiro(a).
        </p>

        <div className="space-x-3">
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
            Entrar
          </Link>
          {/* <Link to="/setup" className="px-4 py-2 border rounded">
            Configuração Inicial
          </Link> */}
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;

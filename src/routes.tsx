import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Rh from "./pages/Rh";
import Financeiro from "./pages/Financeiro";
import Faturacao from "./pages/Faturacao";
import Fiscalidade from "./pages/Fiscalidade";
import Tesouraria from "./pages/Tesouraria";
import DiarioCaixa from "./pages/DiarioCaixa";
import Plafond from "./pages/Plafond";
import ContaBancaria from "./pages/ContaBancaria";
import Configuracoes from "./pages/Configuracoes";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: "rh",
                element: <Rh />,
            },
            {
                path: "financeiro",
                element: <Financeiro />,
            },
            {
                path: "faturacao",
                element: <Faturacao />,
            },
            {
                path: "fiscalidade",
                element: <Fiscalidade />,
            },
            {
                path: "tesouraria",
                element: <Tesouraria />,
            },
            {
                path: "diario-caixa",
                element: <DiarioCaixa />,
            },
            {
                path: "plafond",
                element: <Plafond />,
            },
            {
                path: "contas",
                element: <ContaBancaria />,
            },
            {
                path: "configuracoes",
                element: <Configuracoes />,
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    }
]);

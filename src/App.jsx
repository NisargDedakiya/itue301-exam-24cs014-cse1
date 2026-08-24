import { lazy, Suspense } from "react";
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ClassesPage from "./pages/ClassesPage";
import MyBookingsPage from "./pages/MyBookingsPage";

import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>

                <Navigation />

                <Routes>

                    <Route
                        path="/"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/classes"
                        element={
                            <ProtectedRoute>
                                <ClassesPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-bookings"
                        element={
                            <ProtectedRoute>
                                <MyBookingsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <Suspense
                                fallback={
                                    <p>Loading Admin Panel...</p>
                                }
                            >
                                <AdminPanel />
                            </Suspense>
                        }
                    />

                </Routes>

            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
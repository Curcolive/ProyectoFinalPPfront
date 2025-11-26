import './ForgotPasswordPage.css';
import { useNavigate } from "react-router-dom";

function CompleteProfile() {
    const location = useLocation();
    const { user } = location.state;

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState(user.first_name || '');
    const [lastName, setLastName] = useState(user.last_name || '');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await completeProfile({
            user_id: user.id,
            username,
            first_name: firstName,
            last_name: lastName,
            password
        });

        alert("Perfil completado. Ya podés usar tu contraseña.");
        navigate("/login");
    };

    return (
        <div className="recover-container">
            <div className="recover-card">
                <h1 className="recover-title">Completar perfil</h1>
                <p className="recover-text">
                    Completá tus datos y definí una contraseña para poder iniciar sesión con
                    Google o con usuario y clave cuando lo desees.
                </p>

                <form onSubmit={handleSubmit} className="recover-form">
                    <div className="input-group">
                        <i className="fa-solid fa-id-card"></i>
                        <input
                            type="text"
                            placeholder="Usuario (DNI / Legajo)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <i className="fa-solid fa-user"></i>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <i className="fa-solid fa-user"></i>
                        <input
                            type="text"
                            placeholder="Apellido"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <i className="fa-solid fa-lock"></i>
                        <input
                            type="password"
                            placeholder="Crear contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="btn-submit" type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Guardar"}
                    </button>

                    {error && <p className="error-text">{error}</p>}
                    {message && <p className="success-text">{message}</p>}
                </form>

                <p className="back-login" onClick={() => navigate("/login")}>
                    ← Volver al inicio de sesión
                </p>
            </div>
        </div>
    );
}
export default CompleteProfile;
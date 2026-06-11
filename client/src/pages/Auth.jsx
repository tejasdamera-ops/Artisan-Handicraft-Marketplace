import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../redux/authSlice.js";

const Auth = ({ mode = "login" }) => {
  const isRegister = mode === "register";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    shop: { name: "", bio: "", location: "" }
  });

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateShop = (event) => setForm((current) => ({ ...current, shop: { ...current.shop, [event.target.name]: event.target.value } }));

  const submit = async (event) => {
    event.preventDefault();
    const action = isRegister ? registerUser(form) : loginUser({ email: form.email, password: form.password });
    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isRegister ? "Account created" : "Welcome back");
      const role = result.payload.user.role;
      const fallbackPath = role === "artisan" ? "/artisan" : role === "admin" ? "/admin" : "/";
      navigate(location.state?.from?.pathname || fallbackPath);
    }
  };

  return (
    <section className="section flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <form className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-soft" onSubmit={submit}>
        <p className="text-sm font-semibold uppercase tracking-wide text-clay">{isRegister ? "Create account" : "Welcome back"}</p>
        <h1 className="mt-1 text-3xl font-black">{isRegister ? "Join Artisan Market" : "Login"}</h1>
        <div className="mt-6 grid gap-3">
          {isRegister && <input className="input" name="name" placeholder="Full name" value={form.name} onChange={update} required />}
          <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={update} required />
          <input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={update} required />
          {isRegister && (
            <>
              <select className="input" name="role" value={form.role} onChange={update}>
                <option value="buyer">Buyer</option>
                <option value="artisan">Artisan</option>
              </select>
              {form.role === "artisan" && (
                <div className="grid gap-3 rounded-md bg-stone-50 p-3">
                  <input className="input" name="name" placeholder="Shop name" value={form.shop.name} onChange={updateShop} />
                  <input className="input" name="location" placeholder="Shop location" value={form.shop.location} onChange={updateShop} />
                  <textarea className="input min-h-20" name="bio" placeholder="Shop bio" value={form.shop.bio} onChange={updateShop} />
                </div>
              )}
            </>
          )}
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary" disabled={loading}>
            {isRegister ? "Create account" : "Login"}
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-stone-500">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link className="font-semibold text-leaf" to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </form>
    </section>
  );
};

export default Auth;

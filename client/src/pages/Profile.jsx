import { Bell } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/client.js";
import { fetchNotifications } from "../redux/notificationSlice.js";
import { setUser } from "../redux/authSlice.js";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [form, setForm] = useState(user || {});
  const [avatar, setAvatar] = useState(null);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    if (avatar) data.append("avatar", avatar);
    if (form.shop) data.append("shop", JSON.stringify(form.shop));

    const res = await api.put("/auth/profile", data);
    dispatch(setUser(res.data));
    toast.success("Profile updated");
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    dispatch(fetchNotifications());
  };

  return (
    <section className="section grid gap-6 lg:grid-cols-[420px_1fr]">
      <form className="h-fit rounded-lg border border-stone-200 bg-white p-5" onSubmit={submit}>
        <h1 className="text-2xl font-black">Profile settings</h1>
        <div className="mt-5 grid gap-3">
          <input className="input" name="name" value={form.name || ""} onChange={update} />
          <input className="input" value={form.email || ""} disabled />
          <input className="input" value={form.role || ""} disabled />
          <input className="input" type="file" accept="image/*" onChange={(event) => setAvatar(event.target.files?.[0])} />
          <button className="btn-primary">Save profile</button>
        </div>
      </form>
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <Bell className="h-5 w-5 text-clay" />
            Notifications
          </h2>
          <button className="btn-secondary" onClick={markAllRead}>Mark all read ({unreadCount})</button>
        </div>
        <div className="mt-5 grid gap-3">
          {notifications.map((notification) => (
            <div key={notification._id} className={`rounded-md border p-3 text-sm ${notification.isRead ? "border-stone-200 bg-white text-stone-500" : "border-marigold/40 bg-marigold/10 text-ink"}`}>
              <strong className="capitalize">{notification.type}</strong>
              <p>{notification.message}</p>
            </div>
          ))}
          {!notifications.length && <p className="text-sm text-stone-500">No notifications yet.</p>}
        </div>
      </div>
    </section>
  );
};

export default Profile;

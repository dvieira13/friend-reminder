import { useState, useEffect } from "react";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import "./App.css";
import FriendReminderForm from "./friendReminderForm";

interface ContactNote {
  content: string;
  date: string;
  time: string;
}

interface ContactData {
  id?: string;
  name: string;
  contactPoint: string;
  contactDetail: string;
  notes: ContactNote[];
  dateCreated: string;
  remindDate: string;
  remindTime: string;
}

function App() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState<ContactData | null>(null);
  const [noteInput, setNoteInput] = useState<string>("");
  const [noteForms, setNoteForms] = useState<Record<string, boolean>>({});

  toastr.options = {
    closeButton: true,
    progressBar: false,
    positionClass: "toast-top-right",
    timeOut: 0,
    extendedTimeOut: 0,
  };

  // Load contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/friend-contacts");
        if (!res.ok) throw new Error("Failed to fetch contacts");
        const data = await res.json();
        // Ensure notes is always an array
        const normalized = data.map((c: any) => ({
          ...c,
          notes: Array.isArray(c.notes) ? c.notes : [],
        }));
        setContacts(normalized);
      } catch (err) {
        console.error(err);
      }
    };
    fetchContacts();
  }, []);

  // Reminder checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      contacts.forEach((contact) => {
        if (!contact.id) return;
        const remindDateTime = new Date(`${contact.remindDate}T${contact.remindTime}`);
        const diff = remindDateTime.getTime() - now.getTime();
        if (diff >= 0 && diff < 60000 && !shownReminders.has(contact.id)) {
          toastr.info(
            `Reminder: Contact ${contact.name} via ${contact.contactPoint} (${contact.contactDetail})`,
            "Friend Reminder"
          );
          setShownReminders((prev) => new Set(prev).add(contact.id!));
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [contacts, shownReminders]);

  const handleAddContact = (contact: ContactData) =>
    setContacts((prev) => [...prev, contact]);

  const handleUpdateContact = (contact: ContactData) =>
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));

  const handleDeleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/friend-contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete contact");
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNoteForm = (id: string) => {
    setNoteForms((prev) => ({ ...prev, [id]: !prev[id] }));
    setNoteInput("");
  };

  const handleNewNote = async (contact: ContactData, note: ContactNote) => {
    const updatedContact = { ...contact, notes: [...contact.notes, note] };
    try {
      const res = await fetch(`/api/friend-contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContact),
      });
      if (!res.ok) throw new Error("Failed to update contact");
      const data = await res.json();
      handleUpdateContact(data.contact);
      toggleNoteForm(contact.id!);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h1>Friend Reminder</h1>

      <button
        onClick={() => {
          setEditContact(null);
          setShowForm(true);
        }}
        className="generate-button"
      >
        Create New Contact
      </button>

      <div className="contact-container">
        {[...contacts]
          .sort(
            (a, b) =>
              new Date(`${a.remindDate}T${a.remindTime}`).getTime() -
              new Date(`${b.remindDate}T${b.remindTime}`).getTime()
          )
          .map((c) => (
            <div key={c.id} className="contact-item">
              <div>
                <h3>{c.name}</h3>
                <p>Contact via: {c.contactPoint} — {c.contactDetail}</p>
                <div>
                  Notes:
                  <ul>
                    {c.notes.map((n, idx) => (
                      <li key={idx}>{n.date} {n.time} — {n.content}</li>
                    ))}
                  </ul>
                </div>
                <p>Date Created: {c.dateCreated}</p>
                <p>Reminder: {c.remindDate} at {c.remindTime}</p>
              </div>
              <div>
                <button
                  onClick={() => { setEditContact(c); setShowForm(true); }}
                  className="update-button"
                >
                  Update
                </button>
                <button onClick={() => c.id && handleDeleteContact(c.id)} className="delete-button">
                  Delete
                </button>
                <button onClick={() => c.id && toggleNoteForm(c.id)} className="note-button">
                  Add Note
                </button>
              </div>

              {/* Note form */}
              {noteForms[c.id!] && (
                <div className="form-container">
                  <div className="form-background" onClick={() => toggleNoteForm(c.id!)}></div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!noteInput) return;
                      const now = new Date();
                      handleNewNote(c, {
                        content: noteInput,
                        date: now.toISOString().split("T")[0],
                        time: now.toTimeString().split(" ")[0],
                      });
                      setNoteInput("");
                    }}
                    className="contact-form"
                  >
                    <h2>Add Note</h2>
                    <div>
                      <div>
                        <input
                          type="text"
                          name="note"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          maxLength={512}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="submit-button">
                      Add Note
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
      </div>

      {showForm && (
        <FriendReminderForm
          closeForm={() => setShowForm(false)}
          onSubmitContact={editContact ? handleUpdateContact : handleAddContact}
          mode={editContact ? "edit" : "create"}
          contact={editContact || undefined}
        />
      )}
    </>
  );
}

export default App;

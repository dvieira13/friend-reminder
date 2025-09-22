import { useState, useEffect } from "react";
import "./friendReminderForm.css";

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

interface FriendReminderFormProps {
    closeForm: () => void;
    onSubmitContact: (contact: ContactData) => void;
    mode: "create" | "edit";
    contact?: ContactData;
}

export default function FriendReminderForm({
    closeForm,
    onSubmitContact,
    mode,
    contact,
}: FriendReminderFormProps) {
    const [formData, setFormData] = useState<ContactData>({
        name: "",
        contactPoint: "",
        contactDetail: "",
        notes: [],
        dateCreated: new Date().toISOString().split("T")[0],
        remindDate: "",
        remindTime: "",
    });

    const [newNoteContent, setNewNoteContent] = useState("");

    // Pre-fill when editing
    useEffect(() => {
        if (contact && mode === "edit") {
            setFormData(contact);
        }
    }, [contact, mode]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name === "name" && value.length > 512) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddNote = () => {
        if (!newNoteContent.trim()) return;

        const now = new Date();
        const note: ContactNote = {
            content: newNoteContent.trim(),
            date: now.toISOString().split("T")[0],
            time: now.toTimeString().split(" ")[0].slice(0, 5), // HH:MM
        };

        setFormData((prev) => ({ ...prev, notes: [...prev.notes, note] }));
        setNewNoteContent("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.notes.length === 0) {
            throw {
                response: {
                    status: 400,
                    data: { message: "At least one note is required." },
                },
            }
        }

        try {
            let res;
            if (mode === "create") {
                res = await fetch("/api/friend-contacts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            } else {
                res = await fetch(`/api/friend-contacts/${contact?.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            if (!res.ok) throw new Error("Failed to save contact");
            const data = await res.json();
            onSubmitContact(data.contact);
            closeForm();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="form-container">
            <div className="form-background" onClick={closeForm}></div>
            <form onSubmit={handleSubmit} className="contact-form">
                <h2>{mode === "create" ? "Add Contact" : "Edit Contact"}</h2>

                <div>
                    <label>Name</label>
                    <div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength={512}
                            required
                        />
                        <p>{formData.name.length}/512 characters</p>
                    </div>
                </div>

                <div>
                    <label>Contact Point</label>
                    <select
                        name="contactPoint"
                        value={formData.contactPoint}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select one</option>
                        <option>Email</option>
                        <option>Phone</option>
                        <option>Text</option>
                        <option>Letters</option>
                        <option>Face2Face</option>
                    </select>
                </div>

                <div>
                    <label>Contact Details</label>
                    <input
                        type="text"
                        name="contactDetail"
                        value={formData.contactDetail}
                        onChange={handleChange}
                        placeholder="Enter email, phone, etc."
                        required
                    />
                </div>

                <div>
                    <label>Notes</label>
                    <div className="notes-container">
                        <input
                            type="text"
                            placeholder="Add a note..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                        />
                        <button type="button" onClick={handleAddNote}>
                            Add Note
                        </button>
                        <div>
                            {formData.notes.map((note, idx) => (
                                <p key={idx}>
                                    {note.content} [{note.date} {note.time}]
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {mode === "edit" && (
                    <div>
                        <label>Date Created</label>
                        <p>{formData.dateCreated}</p>
                    </div>
                )}

                <div>
                    <label>Date to Remind</label>
                    <input
                        type="date"
                        name="remindDate"
                        value={formData.remindDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Time to Remind</label>
                    <input
                        type="time"
                        name="remindTime"
                        value={formData.remindTime}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="submit-button">
                    {mode === "create" ? "Save" : "Update"}
                </button>
            </form>
        </div>
    );
}



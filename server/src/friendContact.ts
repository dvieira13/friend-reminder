import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const dataFile = path.join(__dirname, "../data/friendContacts.json");

// Ensure JSON file exists
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf-8");

interface ContactNote {
    content: string;
    date: string;
    time: string;
}

interface FriendContact {
    id: string;
    name: string;
    contactPoint: string;
    contactDetail: string;
    notes: ContactNote[];
    dateCreated: string;
    remindDate: string;
    remindTime: string;
}

// Helper to load contacts
const loadContacts = (): FriendContact[] => {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data).map((c: any) => ({
        ...c,
        notes: Array.isArray(c.notes) ? c.notes : [],
    }));
};

// Helper to save contacts
const saveContacts = (contacts: FriendContact[]) => {
    fs.writeFileSync(dataFile, JSON.stringify(contacts, null, 2), "utf-8");
};

// GET all contacts
router.get("/", (req: Request, res: Response) => {
    try {
        const contacts = loadContacts();
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load contacts" });
    }
});

// POST create contact
router.post("/", (req: Request, res: Response) => {
    try {
        const contacts = loadContacts();
        const newContact: FriendContact = {
            id: Date.now().toString(),
            ...req.body,
            notes: Array.isArray(req.body.notes) ? req.body.notes : [],
        };
        contacts.push(newContact);
        saveContacts(contacts);
        res.status(201).json({ contact: newContact });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save contact" });
    }
});

// PUT update contact
router.put("/:id", (req: Request, res: Response) => {
    try {
        const contacts = loadContacts();
        const idx = contacts.findIndex((c) => c.id === req.params.id);
        if (idx === -1) return res.status(404).json({ message: "Contact not found" });

        const updated = {
            ...contacts[idx],
            ...req.body,
            notes: Array.isArray(req.body.notes) ? req.body.notes : contacts[idx].notes,
        };
        contacts[idx] = updated;
        saveContacts(contacts);
        res.json({ contact: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update contact" });
    }
});

// DELETE contact
router.delete("/:id", (req: Request, res: Response) => {
    try {
        const contacts = loadContacts();
        const filtered = contacts.filter((c) => c.id !== req.params.id);
        saveContacts(filtered);
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete contact" });
    }
});

export default router;

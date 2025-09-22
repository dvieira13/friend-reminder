import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../src/index";

const dataFile = path.join(__dirname, "../data/friendContacts.json");

// Helper to reset test data
const resetTestData = () => {
    fs.writeFileSync(dataFile, "[]", "utf-8");
};

describe("Friend Contacts API", () => {
    beforeEach(() => resetTestData());

    it("GET /api/friend-contacts returns empty array initially", async () => {
        const res = await request(app).get("/api/friend-contacts");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("POST /api/friend-contacts creates a new contact", async () => {
        const newContact = {
            name: "Alice",
            contactPoint: "Email",
            contactDetail: "alice@example.com",
            notes: [],
            dateCreated: "2025-01-01",
            remindDate: "2025-09-30",
            remindTime: "12:00",
        };
        const res = await request(app).post("/api/friend-contacts").send(newContact);
        expect(res.status).toBe(201);
        expect(res.body.contact.name).toBe("Alice");
        expect(res.body.contact.id).toBeDefined();
    });

    it("GET returns contacts after POST", async () => {
        const contact = { name: "Bob", contactPoint: "Phone", contactDetail: "123", notes: [], dateCreated: "2025-01-01", remindDate: "2025-10-01", remindTime: "10:00" };
        await request(app).post("/api/friend-contacts").send(contact);
        const res = await request(app).get("/api/friend-contacts");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Bob");
    });

    it("PUT /api/friend-contacts/:id updates an existing contact", async () => {
        const postRes = await request(app).post("/api/friend-contacts").send({
            name: "Charlie",
            contactPoint: "Text",
            contactDetail: "555",
            notes: [],
            dateCreated: "2025-01-01",
            remindDate: "2025-11-01",
            remindTime: "14:00",
        });
        const id = postRes.body.contact.id;
        const res = await request(app).put(`/api/friend-contacts/${id}`).send({ name: "Charlie Updated" });
        expect(res.status).toBe(200);
        expect(res.body.contact.name).toBe("Charlie Updated");
    });

    it("PUT /api/friend-contacts/:id returns 404 for invalid id", async () => {
        const res = await request(app).put("/api/friend-contacts/invalid-id").send({ name: "X" });
        expect(res.status).toBe(404);
    });

    it("DELETE /api/friend-contacts/:id deletes a contact", async () => {
        const postRes = await request(app).post("/api/friend-contacts").send({
            name: "Dave",
            contactPoint: "Email",
            contactDetail: "dave@example.com",
            notes: [],
            dateCreated: "2025-01-01",
            remindDate: "2025-12-01",
            remindTime: "15:00",
        });
        const id = postRes.body.contact.id;
        const delRes = await request(app).delete(`/api/friend-contacts/${id}`);
        expect(delRes.status).toBe(200);
        const getRes = await request(app).get("/api/friend-contacts");
        expect(getRes.body.find((c: any) => c.id === id)).toBeUndefined();
    });

    it("DELETE /api/friend-contacts/:id returns 200 even if id not found", async () => {
        const res = await request(app).delete("/api/friend-contacts/nonexistent-id");
        expect(res.status).toBe(200);
    });

    it("POST /api/friend-contacts defaults notes to empty array if missing", async () => {
        const res = await request(app).post("/api/friend-contacts").send({
            name: "Eve",
            contactPoint: "Phone",
            contactDetail: "999",
            dateCreated: "2025-01-01",
            remindDate: "2025-09-25",
            remindTime: "09:00",
        });
        expect(res.status).toBe(201);
        expect(Array.isArray(res.body.contact.notes)).toBe(true);
    });

    it("PUT adds new notes to existing notes array", async () => {
        const postRes = await request(app).post("/api/friend-contacts").send({
            name: "Frank",
            contactPoint: "Text",
            contactDetail: "321",
            notes: [],
            dateCreated: "2025-01-01",
            remindDate: "2025-09-26",
            remindTime: "11:00",
        });
        const id = postRes.body.contact.id;
        const note = { content: "New Note", date: "2025-09-20", time: "08:00" };
        const res = await request(app).put(`/api/friend-contacts/${id}`).send({ notes: [note] });
        expect(res.status).toBe(200);
        expect(res.body.contact.notes.length).toBe(1);
        expect(res.body.contact.notes[0].content).toBe("New Note");
    });

    it("Handles multiple contacts correctly", async () => {
        await request(app).post("/api/friend-contacts").send({ name: "A", contactPoint: "Email", contactDetail: "a@example.com", notes: [], dateCreated: "2025-01-01", remindDate: "2025-09-01", remindTime: "10:00" });
        await request(app).post("/api/friend-contacts").send({ name: "B", contactPoint: "Phone", contactDetail: "b@example.com", notes: [], dateCreated: "2025-01-02", remindDate: "2025-09-02", remindTime: "11:00" });
        const res = await request(app).get("/api/friend-contacts");
        expect(res.body.length).toBe(2);
        expect(res.body.map((c: any) => c.name)).toEqual(["A", "B"]);
    });
});

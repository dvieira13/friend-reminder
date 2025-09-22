import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../src/index";

const dataFile = path.join(__dirname, "../data/friendContacts.json");

// Helper to reset test data
const resetTestData = () => {
    fs.writeFileSync(dataFile, "[]", "utf-8");
};

/*Test suite for Friend Contact routes*/
describe("Friend Contacts API", () => {
    beforeEach(() => resetTestData());

    //loading empty data returns empty data
    it("GET /api/friend-contacts returns empty array initially", async () => {
        const res = await request(app).get("/api/friend-contacts");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    //create a new contact
    it("POST /api/friend-contacts creates a new contact", async () => {
        const newContact = {
            name: "Pickle",
            contactPoint: "Email",
            contactDetail: "pickle@example.com",
            notes: [],
            dateCreated: "2025-01-01",
            remindDate: "2025-09-30",
            remindTime: "12:00",
        };
        const res = await request(app).post("/api/friend-contacts").send(newContact);
        expect(res.status).toBe(201);
        expect(res.body.contact.name).toBe("Pickle");
        expect(res.body.contact.id).toBeDefined();
    });

    //GET a created contact
    it("GET returns contacts after POST", async () => {
        const contact = { name: "Bob", contactPoint: "Phone", contactDetail: "123", notes: [], dateCreated: "2025-01-01", remindDate: "2025-10-01", remindTime: "10:00" };
        await request(app).post("/api/friend-contacts").send(contact);
        const res = await request(app).get("/api/friend-contacts");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Bob");
    });

    //Update an existing contact
    it("PUT /api/friend-contacts/:id updates an existing contact", async () => {
        const postRes = await request(app).post("/api/friend-contacts").send({
            name: "Mayo",
            contactPoint: "Text",
            contactDetail: "555",
            notes: [],
            dateCreated: "2025-01-01",
            remindDate: "2025-11-01",
            remindTime: "14:00",
        });
        const id = postRes.body.contact.id;
        const res = await request(app).put(`/api/friend-contacts/${id}`).send({ name: "Mayonnaise" });
        expect(res.status).toBe(200);
        expect(res.body.contact.name).toBe("Mayonnaise");
    });

    //Update an existing contact that doesn't exist
    it("PUT /api/friend-contacts/:id returns 404 for invalid id", async () => {
        const res = await request(app).put("/api/friend-contacts/invalid-id").send({ name: "X" });
        expect(res.status).toBe(404);
    });

    //Delete a contact from storage
    it("DELETE /api/friend-contacts/:id deletes a contact", async () => {
        const postRes = await request(app).post("/api/friend-contacts").send({
            name: "Mustard",
            contactPoint: "Email",
            contactDetail: "mustard@example.com",
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

    //Delete a contact from storage that doesn't exist
    it("DELETE /api/friend-contacts/:id returns 200 even if id not found", async () => {
        const res = await request(app).delete("/api/friend-contacts/nonexistent-id");
        expect(res.status).toBe(200);
    });

    //Can't create a contact without notes
    it("should reject creating a contact with no notes", async () => {
        const newContact = {
            name: "Alice",
            email: "alice@example.com",
            phone: "123-456-7890",
            reminders: [
                { date: "2025-09-22", message: "Say hi!" }
            ],
            //empty field
            notes: []
        };

        const res = await request(app)
            .post("/api/friend-contacts")
            .send(newContact);

        expect(res.status).toBe(201); // or whatever status you use
    });

    //Add note to a contact's list of notes
    it("PUT adds new notes to existing notes array", async () => {
        const postRes = await request(app).post("/api/friend-contacts").send({
            name: "Cheese",
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
        await request(app).post("/api/friend-contacts").send({
            name: "Andrew", contactPoint: "Email", contactDetail: "a@mail.com", notes: [{ "content": "Hi Andrew", "date": "2025-09-1", "time": "10:00" }], dateCreated: "2025-01-01", remindDate: "2025-09-01", remindTime: "10:00"
        });
        await request(app).post("/api/friend-contacts").send({ name: "Sheehan", contactPoint: "Phone", contactDetail: "b@mail.com", notes: [{ "content": "Thanks for testing!", "date": "2025-09-1", "time": "10:00" }], dateCreated: "2025-01-02", remindDate: "2025-09-02", remindTime: "11:00" });
        const res = await request(app).get("/api/friend-contacts");
        expect(res.body.length).toBe(2);
        expect(res.body.map((c: any) => c.name)).toEqual(["Andrew", "Sheehan"]);
    });
});

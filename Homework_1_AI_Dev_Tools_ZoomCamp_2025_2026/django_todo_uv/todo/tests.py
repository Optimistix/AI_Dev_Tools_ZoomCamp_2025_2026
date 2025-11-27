# Create your tests here.

from django.test import TestCase
from django.urls import reverse
from .models import Todo
from datetime import date

class TodoTests(TestCase):

    def setUp(self):
        self.todo = Todo.objects.create(
            title="Test TODO",
            description="A sample todo item",
            due_date=date(2025, 1, 1),
            is_resolved=False
        )

    def test_todo_list_view(self):
        response = self.client.get(reverse("todo_list"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Test TODO")

    def test_create_todo(self):
        response = self.client.post(reverse("todo_create"), {
            "title": "New TODO",
            "description": "Desc",
            "due_date": "2025-12-31",
            "is_resolved": False,
        })
        self.assertEqual(response.status_code, 302)  # redirect after save
        self.assertEqual(Todo.objects.count(), 2)
        self.assertTrue(Todo.objects.filter(title="New TODO").exists())

    def test_edit_todo(self):
        response = self.client.post(
            reverse("todo_edit", args=[self.todo.id]),
            {
                "title": "Updated title",
                "description": "Updated desc",
                "due_date": "2030-01-01",
                "is_resolved": True,
            }
        )
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, "Updated title")
        self.assertTrue(self.todo.is_resolved)

    def test_delete_todo(self):
        response = self.client.get(reverse("todo_delete", args=[self.todo.id]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 0)

    def test_toggle_resolve(self):
        # Initially unresolved → should become resolved
        response = self.client.get(reverse("todo_toggle_resolve", args=[self.todo.id]))
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_resolved)

        # Toggle back to unresolved
        response = self.client.get(reverse("todo_toggle_resolve", args=[self.todo.id]))
        self.todo.refresh_from_db()
        self.assertFalse(self.todo.is_resolved)

    def test_invalid_todo_form_missing_title(self):
        response = self.client.post(reverse("todo_create"), {
            "title": "",
            "description": "Missing title",
            "due_date": "2025-12-31",
            "is_resolved": False,
        })
        # Should re-render form, not redirect
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "This field is required")
        self.assertEqual(Todo.objects.count(), 1)  # Only original exists


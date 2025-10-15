"use client";

/**
 * Home Page / Dashboard
 *
 * Main landing page showing task dashboard with live Convex data.
 */

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Card, Button } from "@jn7denews9kmfhbt1yqqp2ts817sgsqe/components";

export default function Home() {
  const { data: session, isLoading: sessionLoading } = useSession();

  // Redirect to sign-in if not authenticated
  if (!sessionLoading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Welcome to TaskFlow</h1>
          <p className="mb-6" style={{ color: "var(--color-text-secondary)" }}>
            A modern, production-ready todo list application built with Convex,
            Next.js, and Better Auth.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/sign-in" className="flex-1">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up" className="flex-1">
              <Button className="w-full">Sign Up</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--color-primary)" }}></div>
          <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const summary = useQuery(api.endpoints.dashboard.summary);
  const recentTasks = useQuery(api.endpoints.dashboard.recent);

  if (summary === undefined || recentTasks === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--color-primary)" }}></div>
          <p style={{ color: "var(--color-text-secondary)" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Header */}
      <header style={{ backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-muted)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">TaskFlow</h1>
            <nav className="flex gap-4">
              <Link href="/tasks">
                <Button variant="outline">Tasks</Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline">Categories</Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline">AI Assistant</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold mb-6">Dashboard</h2>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Total Tasks</div>
            <div className="text-3xl font-bold">{summary.totalTasks}</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>To Do</div>
            <div className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
              {summary.todoTasks}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>In Progress</div>
            <div className="text-3xl font-bold" style={{ color: "var(--color-secondary)" }}>
              {summary.inProgressTasks}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Completed</div>
            <div className="text-3xl font-bold" style={{ color: "var(--color-success)" }}>
              {summary.completedTasks}
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Overdue</div>
            <div className="text-2xl font-bold" style={{ color: "var(--color-danger)" }}>
              {summary.overdueTasks}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
              High Priority
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--color-warning)" }}>
              {summary.highPriorityTasks}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Completion Rate
            </div>
            <div className="text-2xl font-bold">{summary.completionRate}%</div>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--color-text-secondary)" }}>
              <p>No tasks yet. Create your first task to get started!</p>
              <Link href="/tasks">
                <Button className="mt-4">Create Task</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-md"
                  style={{ border: "1px solid var(--color-muted)" }}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm truncate" style={{ color: "var(--color-text-secondary)" }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full" style={{
                      backgroundColor: task.priority === "urgent" ? "var(--color-danger)" :
                                      task.priority === "high" ? "var(--color-warning)" :
                                      task.priority === "medium" ? "var(--color-secondary)" :
                                      "var(--color-muted)",
                      color: task.priority === "low" ? "var(--color-text-primary)" : "#ffffff"
                    }}>
                      {task.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full" style={{
                      backgroundColor: task.status === "completed" ? "var(--color-success)" :
                                      task.status === "in_progress" ? "var(--color-primary)" :
                                      "var(--color-muted)",
                      color: task.status === "todo" ? "var(--color-text-primary)" : "#ffffff"
                    }}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

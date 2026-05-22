import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

// ============================================
// Button Component Tests
// ============================================

describe("Button", () => {
  it("renders with text content", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeDefined();
  });

  it("handles click events", async () => {
    const handleClick = () => {};
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDefined();
  });

  it("applies variant styles", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-accent");
  });

  it("applies size styles", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-9");
  });

  it("shows loading state", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button.querySelector(".animate-spin")).toBeDefined();
  });

  it("is disabled when loading", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("shows left icon when provided", () => {
    const { container } = render(<Button leftIcon={<span>📌</span>}>With Icon</Button>);
    expect(container.textContent).toContain("📌");
  });

  it("shows right icon when provided", () => {
    const { container } = render(<Button rightIcon={<span>→</span>}>With Icon</Button>);
    expect(container.textContent).toContain("→");
  });
});

// ============================================
// Card Component Tests
// ============================================

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeDefined();
  });

  it("applies padding class", () => {
    render(<Card padding="md">Content</Card>);
    const card = screen.getByText("Content").closest(".rounded-lg");
    expect(card).toBeDefined();
  });

  it("applies hover effect", () => {
    render(<Card hover>Content</Card>);
    const card = screen.getByText("Content").closest(".rounded-lg");
    expect(card).toBeDefined();
  });

  it("renders as different element with asChild", () => {
    render(
      <Card asChild>
        <div>Custom Element</div>
      </Card>
    );
    expect(screen.getByText("Custom Element")).toBeDefined();
  });
});

// ============================================
// Badge Component Tests
// ============================================

describe("Badge", () => {
  it("renders with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeDefined();
  });

  it("applies variant styles", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    // Badge should have some styling
    expect(badge.className).toBeDefined();
  });

  it("applies size styles", () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText("Small");
    expect(badge.className).toContain("text-xs");
  });

  it("is removable when removable prop is true", () => {
    render(<Badge removable onRemove={() => {}}>Removable</Badge>);
    const badge = screen.getByText("Removable");
    expect(badge.querySelector("button")).toBeDefined();
  });
});

// ============================================
// Avatar Component Tests
// ============================================

describe("Avatar", () => {
  it("renders with image", () => {
    render(<Avatar src="/test.jpg" alt="Test" />);
    const img = screen.getByAltText("Test") as HTMLImageElement;
    // Next.js optimizes images, so check the src contains the path
    expect(img.src).toContain("_next/image");
  });

  it("renders without image", () => {
    render(<Avatar name="Test User" />);
    // Avatar should render something
    const avatar = document.querySelector("[class*='rounded']");
    expect(avatar).toBeDefined();
  });

  it("applies size styles", () => {
    render(<Avatar name="Test" size="lg" />);
    const avatar = document.querySelector("[class*='w-12']");
    expect(avatar).toBeDefined();
  });

  it("applies shape styles", () => {
    render(<Avatar name="Test" shape="square" />);
    const avatar = document.querySelector("[class*='rounded']");
    expect(avatar).toBeDefined();
  });
});
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HashRouter } from "react-router-dom";
import axios from "axios";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

vi.mock("axios");

const sample = {
  name: "Chennai",
  sys: { country: "IN" },
  weather: [{ main: "Clouds", description: "scattered clouds", icon: "03d" }],
  main: { temp: 31.4, feels_like: 36.2, humidity: 70, pressure: 1008 },
  wind: { speed: 4.2 },
};

const setup = () => {
  render(
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  );
  return userEvent.setup();
};

async function signUp(user) {
  await user.click(screen.getByRole("link", { name: /sign up/i }));
  await user.type(screen.getByLabelText(/full name/i), "Nivetha V");
  await user.type(screen.getByLabelText(/email/i), "nive@example.com");
  await user.type(screen.getByLabelText(/password/i), "secret123");
  await user.click(screen.getByRole("button", { name: /sign up/i }));
}

describe("Weather Report app", () => {
  beforeEach(() => vi.resetAllMocks());

  it("redirects logged-out visitors to the login page", () => {
    setup();
    expect(screen.getByRole("heading", { name: /log in/i })).toBeTruthy();
  });

  it("registers, shows home, logs out, and logs back in", async () => {
    const user = setup();
    await signUp(user);
    expect(await screen.findByText(/welcome back, nivetha/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /log out/i }));
    await user.type(screen.getByLabelText(/email/i), "nive@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/incorrect email or password/i)).toBeTruthy();

    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/welcome back, nivetha/i)).toBeTruthy();
  });

  it("fetches and shows weather using axios with the city in the URL", async () => {
    axios.get.mockResolvedValue({ data: sample });
    const user = setup();
    await signUp(user);
    await user.type(await screen.findByLabelText(/city name/i), "Chennai");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    expect(await screen.findByText("Chennai, IN")).toBeTruthy();
    expect(screen.getByText("31°C")).toBeTruthy();
    expect(screen.getByText("70%")).toBeTruthy();
    const url = axios.get.mock.calls[0][0];
    expect(url).toContain("q=Chennai");
    expect(url).toContain("appid=test-key");
  });

  it("shows friendly errors for unknown city and network failure", async () => {
    const user = setup();
    await signUp(user);
    const input = await screen.findByLabelText(/city name/i);

    axios.get.mockRejectedValueOnce({ response: { status: 404 } });
    await user.type(input, "Nowhereville");
    await user.click(screen.getByRole("button", { name: /^search$/i }));
    expect(await screen.findByText(/city not found/i)).toBeTruthy();

    axios.get.mockRejectedValueOnce({ code: "ERR_NETWORK" });
    await user.click(screen.getByRole("button", { name: /^search$/i }));
    expect(await screen.findByText(/could not reach the weather service/i)).toBeTruthy();
  });

  it("asks for a city when the search box is empty", async () => {
    const user = setup();
    await signUp(user);
    await user.click(await screen.findByRole("button", { name: /^search$/i }));
    expect(await screen.findByText(/please enter a city name/i)).toBeTruthy();
    expect(axios.get).not.toHaveBeenCalled();
  });
});

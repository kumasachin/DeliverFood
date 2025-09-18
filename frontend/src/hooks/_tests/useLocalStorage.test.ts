import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("default");
  });

  it("returns stored value from localStorage", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("stored-value");
  });

  it("updates localStorage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    const [, setValue] = result.current;
    act(() => {
      setValue("new-value");
    });

    expect(localStorage.getItem("test-key")).toBe('"new-value"');
  });
});

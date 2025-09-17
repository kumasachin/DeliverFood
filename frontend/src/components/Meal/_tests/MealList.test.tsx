import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { MealList } from "../MealList";

const mockUseMeals = jest.fn();
const mockUseSearchFilter = jest.fn();

jest.mock("../../hooks", () => ({
  useMeals: () => mockUseMeals(),
  useSearchFilter: () => mockUseSearchFilter(),
}));

const mockMeals = [
  {
    uuid: "1",
    title: "Pizza Margherita",
    description: "Classic pizza with tomato and mozzarella",
    price: 12.99,
    restaurant_uuid: "rest1",
  },
  {
    uuid: "2",
    title: "Burger Deluxe",
    description: "Gourmet burger with premium ingredients",
    price: 15.99,
    restaurant_uuid: "rest1",
  },
];

const mockRestaurant = {
  id: "rest1",
  uuid: "rest1",
  name: "Test Restaurant",
  description: "A test restaurant",
  cuisine: "Italian",
  category: "Italian",
  image: "restaurant.jpg",
  rating: 4.5,
  deliveryTime: "30-45 min",
  ownerUuid: "owner1",
};

const renderMealList = (props = {}) => {
  return render(
    <BrowserRouter>
      <MealList restaurant={mockRestaurant} {...props} />
    </BrowserRouter>
  );
};

describe("MealList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseMeals.mockReturnValue({
      meals: [],
      loading: true,
      error: null,
    });

    renderMealList();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseMeals.mockReturnValue({
      meals: [],
      loading: false,
      error: "Failed to load meals",
    });

    renderMealList();

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("renders meal list", () => {
    mockUseMeals.mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
    });

    mockUseSearchFilter.mockReturnValue({
      searchTerm: "",
      setSearchTerm: jest.fn(),
      filteredItems: mockMeals.map((m) => ({
        id: m.uuid,
        uuid: m.uuid,
        name: m.title,
        description: m.description,
        price: m.price,
        restaurantId: m.restaurant_uuid,
        image: "/assets/meals/meal.png",
        category: "Main Course",
      })),
    });

    renderMealList();

    expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
    expect(screen.getByText("Burger Deluxe")).toBeInTheDocument();
  });

  it("shows empty state when no meals found", () => {
    mockUseMeals.mockReturnValue({
      meals: mockMeals,
      loading: false,
      error: null,
    });

    mockUseSearchFilter.mockReturnValue({
      searchTerm: "nonexistent",
      setSearchTerm: jest.fn(),
      filteredItems: [],
    });

    renderMealList();

    expect(
      screen.getByText(/no meals found/i) || screen.getByText(/no items found/i)
    ).toBeInTheDocument();
  });
});

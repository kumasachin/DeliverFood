import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { RestaurantList } from "../RestaurantList";

const mockUseRestaurants = jest.fn();
const mockUseSearchFilter = jest.fn();

jest.mock("../../hooks", () => ({
  useRestaurants: () => mockUseRestaurants(),
  useSearchFilter: () => mockUseSearchFilter(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockRestaurants = [
  {
    uuid: "1",
    title: "Pizza Palace",
    description: "Best pizza in town",
    cuisine: "Italian",
    owner_uuid: "owner1",
  },
  {
    uuid: "2",
    title: "Burger House",
    description: "Gourmet burgers",
    cuisine: "American",
    owner_uuid: "owner2",
  },
];

const renderRestaurantList = (props = {}) => {
  return render(
    <BrowserRouter>
      <RestaurantList {...props} />
    </BrowserRouter>
  );
};

describe("RestaurantList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseRestaurants.mockReturnValue({
      restaurants: [],
      loading: true,
      error: null,
    });

    renderRestaurantList();

    expect(screen.getByText("Loading restaurants...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseRestaurants.mockReturnValue({
      restaurants: [],
      loading: false,
      error: "Failed to load restaurants",
    });

    renderRestaurantList();

    expect(screen.getByText(/Error loading restaurants/)).toBeInTheDocument();
  });

  it("renders restaurant list", () => {
    mockUseRestaurants.mockReturnValue({
      restaurants: mockRestaurants,
      loading: false,
      error: null,
    });

    mockUseSearchFilter.mockReturnValue({
      searchTerm: "",
      setSearchTerm: jest.fn(),
      filteredItems: mockRestaurants.map((r) => ({
        id: r.uuid,
        uuid: r.uuid,
        name: r.title,
        description: r.description,
        cuisine: r.cuisine,
        category: r.cuisine,
        image: "/assets/restaurants/restaurant.png",
        rating: 4.5,
        deliveryTime: "30-45 min",
        ownerUuid: r.owner_uuid,
      })),
    });

    renderRestaurantList();

    expect(screen.getByTestId("restaurant-list-title")).toBeInTheDocument();
    expect(screen.getByTestId("restaurant-search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("restaurants-grid")).toBeInTheDocument();
    expect(screen.getByTestId("restaurant-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("restaurant-card-2")).toBeInTheDocument();
  });

  it("shows empty state when no restaurants match search", () => {
    mockUseRestaurants.mockReturnValue({
      restaurants: mockRestaurants,
      loading: false,
      error: null,
    });

    mockUseSearchFilter.mockReturnValue({
      searchTerm: "nonexistent",
      setSearchTerm: jest.fn(),
      filteredItems: [],
    });

    renderRestaurantList();

    expect(screen.getByTestId("no-restaurants-message")).toBeInTheDocument();
  });

  it("handles restaurant click", () => {
    const mockOnSelectRestaurant = jest.fn();

    mockUseRestaurants.mockReturnValue({
      restaurants: mockRestaurants,
      loading: false,
      error: null,
    });

    const mappedRestaurants = mockRestaurants.map((r) => ({
      id: r.uuid,
      uuid: r.uuid,
      name: r.title,
      description: r.description,
      cuisine: r.cuisine,
      category: r.cuisine,
      image: "/assets/restaurants/restaurant.png",
      rating: 4.5,
      deliveryTime: "30-45 min",
      ownerUuid: r.owner_uuid,
    }));

    mockUseSearchFilter.mockReturnValue({
      searchTerm: "",
      setSearchTerm: jest.fn(),
      filteredItems: mappedRestaurants,
    });

    renderRestaurantList({ onSelectRestaurant: mockOnSelectRestaurant });

    fireEvent.click(screen.getByTestId("restaurant-card-1"));

    expect(mockOnSelectRestaurant).toHaveBeenCalledWith(mappedRestaurants[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/meals");
  });
});

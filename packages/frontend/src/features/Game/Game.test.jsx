/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import Game from './index.jsx'

const renderComponent = () => {
    render(<Game />);
}

const fetchCharacters = vi.fn(() => ["1", "2", "3"]);
vi.mock('./utils/fetchAPI', () => ({
    fetchCharacters: () => fetchCharacters,
}));

describe("UI/DOM Testing...", () => {
    describe("The title of the characters remaining area...", () => {
        test("Should exist on the page", () => {
            renderComponent();
            const charactersRemainingTitle = screen.getByRole("heading", { name: "characters-remaining" });
            expect(charactersRemainingTitle).toBeInTheDocument();
        });
    });
    describe("The list of the characters remaining...", () => {
        test("Should contain the same number of children as characters returned from the server", () => {
            renderComponent();
            const characters = screen.getAllByRole("listitem", { name: "character" });
            expect(characters.length).toBe(3);
        });
    });
    describe("The 'Start Game' button...", () => {
        test("Should exist on the page by default", () => {
            renderComponent();
            const startGameButton = screen.getByRole("button", { name: /Start Game/i });
            expect(startGameButton).toBeInTheDocument();
        });
        test("When clicked, should be removed", async () => {
            const user = userEvent.setup();
            renderComponent();
            const startGameButton = screen.getByRole("button", { name: /Start Game/i });
            await user.click(startGameButton);
            expect(startGameButton).not.toBeInTheDocument();
        });
    });
});
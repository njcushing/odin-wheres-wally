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

const startGame = async (user) => {
    renderComponent();
    const startGameButton = screen.getByRole("button", { name: /Start Game/i });
    await user.click(startGameButton);
}

vi.mock('@/features/NavBar/components/NavigationButton', () => ({ 
    default: ({
        text,
        onClickHandler,
        link,
    }) => {
        return (<></>);
    }
}));

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
        test(`Should contain the same number of children as characters returned
         from the server`, () => {
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
            await startGame(user);
            const startGameButton = screen.queryByRole("button", { name: /Start Game/i });
            expect(startGameButton).toBeNull();
        });
    });
    describe("The Game Image...", () => {
        test("Should not exist on the page before the game has started", () => {
            renderComponent();
            const gameImage = screen.queryByRole("img", { name: "Image containing the characters to locate." });
            expect(gameImage).toBeNull();
        });
        test(`Should be loaded in when the 'Start Game' button has just been
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            expect(gameImage).toBeInTheDocument();
        });
    });
    describe("The Selection Box...", () => {
        test("Should not exist on the page before the game has started", () => {
            renderComponent();
            const selectionBox = screen.queryByRole("generic", { name: "selection-area" });
            expect(selectionBox).toBeNull();
        });
        test(`Should not exist on the page when the 'Start Game' button has just
         been clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const selectionBox = screen.queryByRole("generic", { name: "selection-area" });
            expect(selectionBox).toBeNull();
        });
        test(`Should be present when the game has started and the game image is
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const selectionBox = screen.getByRole("generic", { name: "selection-area" });
            expect(selectionBox).toBeInTheDocument();
        });
        test(`If it is present, it should be removed when the game image is
         clicked`, async () => {
            const user = userEvent.setup();
            await startGame(user);
            const gameImage = screen.getByRole("img", { name: "Image containing the characters to locate." });
            await user.click(gameImage);
            const selectionBox = screen.getByRole("generic", { name: "selection-area" });
            await user.click(gameImage);
            expect(selectionBox).not.toBeInTheDocument();
        });
    });
});
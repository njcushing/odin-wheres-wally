/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import GameSelection from './index.jsx'

const renderComponent = async () => {
    render(<GameSelection />);
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

vi.mock('./utils/getGames', () => {
    return {
        default: () => vi.fn(() => {
            return [
                {
                    name: "Game 1",
                    id: "1",
                },
                {
                    name: "Game 2",
                    id: "2",
                },
                {
                    name: "Game 3",
                    id: "3",
                },
            ];
        }),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The game selection title element...", () => {
        test("Should exist on the page", async () => {
            await act(() => renderComponent());
            const gameSelectionTitle = screen.getByRole("heading", { name: "game-selection-title" });
            expect(gameSelectionTitle).toBeInTheDocument();
        });
    });
    describe("The game selection list...", () => {
        test("Should exist on the page", async () => {
            await act(() => renderComponent());
            const gameSelectionList = screen.getByRole("list", { name: "game-selection-list" });
            expect(gameSelectionList).toBeInTheDocument();
        });
        test(`Should have as many list items as there are games returned by the
         getGames API function`, async () => {
            await act(() => renderComponent());
            const gameSelectionItems = screen.getAllByRole("listitem", { name: "game-selection-item" });
            expect(gameSelectionItems.length).toBe(3);
        });
    });
});

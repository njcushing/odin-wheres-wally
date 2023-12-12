/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import HighScores from './index.jsx'

const renderComponent = () => {
    render(<HighScores />);
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

vi.mock('./utils/getHighScores', () => {
    return {
        default: () => vi.fn(() => {
            return [
                {
                    firstName: "Davey",
                    lastName: "Jones",
                    time: 213,
                    date_achieved: "",
                },
                {
                    firstName: "Elizabeth",
                    lastName: "Swann",
                    time: 297,
                    date_achieved: "",
                },
                {
                    firstName: "Jack",
                    lastName: "Sparrow",
                    time: 345,
                    date_achieved: "",
                },
                {
                    firstName: "John",
                    lastName: "Smith",
                    time: 380,
                    date_achieved: "",
                },
                {
                    firstName: "William",
                    lastName: "Turner",
                    time: 645,
                    date_achieved: "",
                },
            ];
        }),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The high scores title element...", () => {
        test("Should exist on the page", async () => {
            renderComponent();
            const highScoresTitle = screen.getByRole("heading", { name: "high-scores-title" });
            expect(highScoresTitle).toBeInTheDocument();
        });
    });
    describe("The high scores list...", () => {
        test("Should exist on the page", () => {
            renderComponent();
            const highScoresList = screen.getByRole("list", { name: "high-scores-list" });
            expect(highScoresList).toBeInTheDocument();
        });
        test(`Should have as many list items as there are high-scores returned
         by the getHighScores API function`, async () => {
            await act(() => renderComponent());
            const highScores = screen.getAllByRole("listitem", { name: "high-score" });
            expect(highScores.length).toBe(5);
        });
    });
    describe("The high scores...", () => {
        test("Should each contain information about the score", async () => {
            await act(() => renderComponent());
            const highScores = screen.getAllByRole("heading", { name: "high-score-information" });
            expect(highScores.length).toBe(5);
        });
    });
});

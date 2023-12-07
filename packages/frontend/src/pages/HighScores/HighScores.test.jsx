/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe("UI/DOM Testing...", () => {
    describe("The high scores title element...", () => {
        test("Should exist on the page", () => {
            renderComponent();
            const highScoresTitle = screen.getByRole("heading", { name: "high-scores-title" });
            expect(highScoresTitle).toBeInTheDocument();
        });
    });
});

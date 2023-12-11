/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import HighScoreForm from './index.jsx'

vi.mock('@/components/MaterialSymbolsButton', () => ({ 
    default: ({
        onClickHandler,
    }) => {
        return (
            <button
                onClick={(e) => {
                    onClickHandler(e);
                }}
                aria-label="material-symbols-button"
            ></button>
        );
    }
}));

const renderComponent = () => {
    render(
        <HighScoreForm
            onCloseHandler={() => {}}
            onSubmitHandler={() => {}}
            submissionErrors={[]}
        />
    );
}

describe("UI/DOM Testing...", () => {
    describe("The MaterialSymbolsButton component...", () => {
        test(`When clicked, should invoke the 'onCloseHandler' callback function
         provided as a prop`, async () => {
            const user = userEvent.setup();
            const onCloseHandler = vi.fn();
            render(
                <HighScoreForm
                    onCloseHandler={onCloseHandler}
                    onSubmitHandler={() => {}}
                    submissionErrors={[]}
                />
            );
            const materialSymbolsButton = screen.getByRole("button", { name: "material-symbols-button" });
            await user.click(materialSymbolsButton);
            expect(onCloseHandler).toHaveBeenCalledTimes(1);
        });
    });
    describe("The 'requirement message'...", () => {
        test("Should be present in the document", () => {
            renderComponent();
            const requirementMessage = screen.getByRole("heading", { name: "requirement-message" });
            expect(requirementMessage).toBeInTheDocument();
        });
    });
    describe("The form...", () => {
        test("Should contain a 'First Name' input", () => {
            renderComponent();
            const firstNameInput = screen.getByRole("textbox", { name: /First Name */i });
            expect(firstNameInput).toBeInTheDocument();
        });
        test("Should contain a 'Last Name' input", () => {
            renderComponent();
            const lastNameInput = screen.getByRole("textbox", { name: /Last Name */i });
            expect(lastNameInput).toBeInTheDocument();
        });
        test("Should contain a 'Submit' button", () => {
            renderComponent();
            const submitButton = screen.getByRole("button", { name: "submit" });
            expect(submitButton).toBeInTheDocument();
        });
    });
    describe("The 'Submit' button...", () => {
        test(`When clicked, should invoke the 'onSubmitHandler' callback
         function provided as a prop`, async () => {
            const user = userEvent.setup();
            const onSubmitHandler = vi.fn();
            render(
                <HighScoreForm
                    onCloseHandler={() => {}}
                    onSubmitHandler={onSubmitHandler}
                    submissionErrors={[]}
                />
            );
            const submitButton = screen.getByRole("button", { name: "submit" });
            await user.click(submitButton);
            expect(onSubmitHandler).toHaveBeenCalledTimes(1);
        });
    });
    describe("The title for the list of submission errors...", () => {
        test("Should not be present if there are no errors", () => {
            renderComponent();
            const submissionErrorsTitle = screen.queryByRole("heading", { name: "error-title" });
            expect(submissionErrorsTitle).toBeNull();
        });
        test("Should be present if there is at least one error", () => {
            render(
                <HighScoreForm
                    onCloseHandler={() => {}}
                    onSubmitHandler={() => {}}
                    submissionErrors={["error_1"]}
                />
            );
            const submissionErrorsTitle = screen.getByRole("heading", { name: "error-title" });
            expect(submissionErrorsTitle).toBeInTheDocument();
        });
    });
    describe("The list of submission errors...", () => {
        test("Should not be present if there are no errors", () => {
            renderComponent();
            const errorList = screen.queryByRole("list", { name: "error-list" });
            expect(errorList).toBeNull();
        });
        test("Should be present if there is at least one error", () => {
            render(
                <HighScoreForm
                    onCloseHandler={() => {}}
                    onSubmitHandler={() => {}}
                    submissionErrors={["error_1"]}
                />
            );
            const errorList = screen.getByRole("list", { name: "error-list" });
            expect(errorList).toBeInTheDocument();
        });
        test("Should contain list items for each error in the array", () => {
            render(
                <HighScoreForm
                    onCloseHandler={() => {}}
                    onSubmitHandler={() => {}}
                    submissionErrors={[
                        "error_1",
                        "error_2",
                        "error_3",
                    ]}
                />
            );
            const errors = screen.getAllByRole("listitem", { name: "error-item" });
            expect(errors.length).toBe(3);
        })
    });
});
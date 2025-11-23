"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type CustomPaginationProps = {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    isLoading: boolean;
    onPageChange: (page: number) => void;
};

const CustomPagination = ({
                             currentPage,
                             totalPages,
                             hasNext,
                             isLoading,
                             onPageChange,
                         }: CustomPaginationProps) => {
    const maxPageButtons = 5;

    const renderPages = () => {
        const pages = [];
        let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = startPage + maxPageButtons - 1;

        if (endPage >= totalPages) {
            endPage = totalPages - 1;
            startPage = Math.max(0, endPage - maxPageButtons + 1);
        }

        if (startPage > 0) {
            pages.push(
                <PaginationItem key="start-ellipsis">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isLoading) onPageChange(i);
                        }}
                        isActive={i === currentPage}
                    >
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages - 1) {
            pages.push(
                <PaginationItem key="end-ellipsis">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 0 && !isLoading) onPageChange(currentPage - 1);
                        }}
                    />
                </PaginationItem>

                {renderPages()}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (hasNext && !isLoading) onPageChange(currentPage + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default CustomPagination;
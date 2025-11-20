'use client';

import { Comment } from '@prisma/client';
import { useState } from 'react';
import Link from 'next/link';

interface CommentTableProps {
  comments: (Comment & {
    author: {
      firstName: string;
      lastName: string;
    };
  })[];
}

const CommentTable = ({ comments = [] }: CommentTableProps) => {
  const [filter, setFilter] = useState<string>('LATEST');

  const getFilteredComments = () => {
    let filtered = [...comments];

    if (filter === 'LATEST') {
      // Sort descending by updatedAt and take latest 5
      filtered = filtered
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
    } else if (filter === 'ALL') {
      // Sort descending by updatedAt, show all
      filtered = filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    // Optionally, return ascending if you prefer
    return filtered.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  };

  const sortedComments = getFilteredComments();

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="row mt-4">
      <div className="col">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Comments</h3>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="LATEST">Latest 5</option>
                <option value="ALL">Show All</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <div className="list-group">
              {sortedComments.length > 0 ? (
                sortedComments.map((comment) => (
                  <div key={comment.id} className="list-group-item">
                    <div className="d-flex w-100 justify-content-between align-items-start flex-column">
                      <small className="text-muted mb-1">
                        Author:
                        {' '}
                        {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Unknown'}
                        {' '}
                        |
                        {' '}
                        Created:
                        {' '}
                        {formatDate(comment.createdAt)}
                        {' '}
                        | Last Updated:
                        {' '}
                        {formatDate(comment.updatedAt)}
                      </small>
                      <p className="mb-0">
                        <Link
                          href={`/project/${comment.projectId}/comment/${comment.id}`}
                          className="text-decoration-none text-dark"
                        >
                          {comment.content}
                        </Link>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="list-group-item text-center text-muted">No comments found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentTable;

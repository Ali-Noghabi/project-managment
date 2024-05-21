import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card';
import { Paper, Typography } from '@mui/material';
import './Column.css';

const Column = ({ column, tasks }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Paper className="column">
      <Typography variant="h6">{column.title}</Typography>
      <div ref={setNodeRef} className="task-list">
        {tasks.map((task, index) => (
          <Card key={task.id} task={task} index={index} />
        ))}
      </div>
    </Paper>
  );
};

export default Column;

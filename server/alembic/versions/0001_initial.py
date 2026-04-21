"""initial

Revision ID: 0001
Revises:
Create Date: 2026-04-21 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('plan', sa.String(), nullable=False, server_default='free'),
        sa.Column('timezone', sa.String(), nullable=False, server_default='UTC'),
        sa.Column('email_reminders_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('reminder_time', sa.String(), nullable=False, server_default='09:00'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_table(
        'sessions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('label', sa.String(), nullable=True),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=False),
        sa.Column('focus_rating', sa.Integer(), nullable=False),
        sa.Column('distraction_type', sa.String(), nullable=False),
        sa.Column('distraction_note', sa.String(), nullable=True),
        sa.Column('what_went_well', sa.String(), nullable=True),
        sa.Column('what_to_do_better', sa.String(), nullable=True),
        sa.Column('could_be_python', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('sessions')
    op.drop_table('users')

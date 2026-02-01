"""Initial tenant/device/alert schema

Revision ID: 20240201_01
Revises: 
Create Date: 2026-02-01 00:00:00.000000
"""
from __future__ import annotations

import uuid

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20240201_01"
down_revision = None
branch_labels = None
depends_on = None

DEFAULT_TENANT_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
DEFAULT_TENANT_NAME = "Default Tenant"
DEFAULT_TENANT_SLUG = "default"


def upgrade() -> None:
    op.create_table(
        "tenants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("email", sa.String, nullable=False),
        sa.Column("password_hash", sa.String, nullable=False),
        sa.Column("full_name", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    device_status_enum = sa.Enum("active", "inactive", "maintenance", name="devicestatus")
    alert_status_enum = sa.Enum("open", "acked", "resolved", name="alertstatus")
    alert_severity_enum = sa.Enum("warning", "critical", name="alertseverity")

    op.create_table(
        "devices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("mqtt_topic_base", sa.String(length=255), nullable=False),
        sa.Column("device_key", sa.String(length=255), nullable=False, unique=True),
        sa.Column("status", device_status_enum, nullable=False, server_default=sa.text("'active'::devicestatus")),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_index("ix_devices_tenant_id", "devices", ["tenant_id"])

    op.create_table(
        "thresholds",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("metric_key", sa.String(length=50), nullable=False),
        sa.Column("min_value", sa.Float, nullable=True),
        sa.Column("max_value", sa.Float, nullable=True),
        sa.Column("hysteresis", sa.Float, nullable=True),
        sa.Column("enabled", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("device_id", "metric_key", name="uq_threshold_metric"),
    )

    alerts_table = op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("metric_key", sa.String(length=50), nullable=False),
        sa.Column("status", alert_status_enum, nullable=False, server_default=sa.text("'open'::alertstatus")),
        sa.Column("severity", alert_severity_enum, nullable=False, server_default=sa.text("'critical'::alertseverity")),
        sa.Column("message", sa.String(length=512), nullable=False),
        sa.Column("value", sa.Float, nullable=True),
        sa.Column("threshold_min", sa.Float, nullable=True),
        sa.Column("threshold_max", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("acked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_alerts_tenant_status", "alerts", ["tenant_id", "status"])

    op.execute(
        sa.text(
            "INSERT INTO tenants (id, name, slug) VALUES (:id, :name, :slug) ON CONFLICT (id) DO NOTHING"
        ).bindparams(id=DEFAULT_TENANT_ID, name=DEFAULT_TENANT_NAME, slug=DEFAULT_TENANT_SLUG)
    )


def downgrade() -> None:
    op.drop_index("ix_alerts_tenant_status", table_name="alerts")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("alerts")
    op.drop_table("thresholds")
    op.drop_index("ix_devices_tenant_id", table_name="devices")
    op.drop_table("devices")
    op.drop_table("users")
    op.drop_table("tenants")
    op.execute("DROP TYPE IF EXISTS alertseverity")
    op.execute("DROP TYPE IF EXISTS alertstatus")
    op.execute("DROP TYPE IF EXISTS devicestatus")

"""add auth.users -> Profiles bootstrap trigger

Revision ID: 2b4f0f7ac9e1
Revises: 043d99a4bf12
Create Date: 2026-04-26 20:05:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '2b4f0f7ac9e1'
down_revision: Union[str, Sequence[str], None] = '043d99a4bf12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        """
        CREATE OR REPLACE FUNCTION public.handle_auth_user_profile_bootstrap()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public, auth
        AS $$
        BEGIN
            INSERT INTO public."Profiles" (id, email, role, is_approved, provider)
            VALUES (
                NEW.id::text,
                NEW.email,
                'user',
                FALSE,
                COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
            )
            ON CONFLICT (id) DO NOTHING;

            RETURN NEW;
        END;
        $$;
        """
    )

    op.execute(
        """
        DROP TRIGGER IF EXISTS on_auth_user_created_profile_bootstrap ON auth.users;
        DROP TRIGGER IF EXISTS on_auth_user_created_profile_sync ON auth.users;
        CREATE TRIGGER on_auth_user_created_profile_bootstrap
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_auth_user_profile_bootstrap();
        """
    )

    op.execute(
        """
        INSERT INTO public."Profiles" (id, email, role, is_approved, provider)
        SELECT
            u.id::text,
            u.email,
            'user',
            FALSE,
            COALESCE(u.raw_app_meta_data->>'provider', 'email')
        FROM auth.users u
        LEFT JOIN public."Profiles" p ON p.id = u.id::text
        WHERE p.id IS NULL;
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        """
        DROP TRIGGER IF EXISTS on_auth_user_created_profile_bootstrap ON auth.users;
        DROP TRIGGER IF EXISTS on_auth_user_created_profile_sync ON auth.users;
        DROP FUNCTION IF EXISTS public.handle_auth_user_profile_bootstrap();
        DROP FUNCTION IF EXISTS public.handle_new_auth_user_profile_sync();
        """
    )

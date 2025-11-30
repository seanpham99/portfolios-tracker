import os
import logging
import requests


def send_telegram_message(context, status):
    """
    Sends a Telegram notification based on the DAG run status.
    """
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")

    if not token or not chat_id:
        logging.warning("Telegram credentials not found. Skipping notification.")
        return

    dag_id = context.get("dag").dag_id
    run_id = context.get("run_id")
    execution_date = context.get("logical_date") or context.get("execution_date")

    if status == "FAILED":
        emoji = "🔴"
        task_instance = context.get("task_instance")
        task_id = task_instance.task_id if task_instance else "Unknown"
        exception = context.get("exception")
        text = (
            f"{emoji} *DAG Failed*\n"
            f"DAG: `{dag_id}`\n"
            f"Task: `{task_id}`\n"
            f"Run ID: `{run_id}`\n"
            f"Time: `{execution_date}`\n"
            f"Error: `{exception}`"
        )
    else:
        emoji = "🟢"
        text = (
            f"{emoji} *DAG Success*\n"
            f"DAG: `{dag_id}`\n"
            f"Run ID: `{run_id}`\n"
            f"Time: `{execution_date}`"
        )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logging.info(f"Telegram notification sent for {dag_id}")
    except Exception as e:
        logging.error(f"Failed to send Telegram notification: {e}")


def send_success_notification(context):
    send_telegram_message(context, status="SUCCESS")


def send_failure_notification(context):
    send_telegram_message(context, status="FAILED")
